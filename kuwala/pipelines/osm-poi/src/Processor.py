import itertools
import json
import logging
import nominatim_controller
import os
import time
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import coalesce, col, explode, lit, udf
from pyspark.sql.types import \
    ArrayType, BooleanType, FloatType, IntegerType, NullType, StringType, StructField, StructType
from python_utils.src.FileSelector import select_local_osm_file
from python_utils.src.spark_udfs import create_geo_json_based_on_coordinates, get_centroid_of_geo_json, get_h3_index

DEFAULT_RESOLUTION = 15


class Processor:
    @staticmethod
    def load_resource(file_name: str):
        with open(f'../resources/{file_name}') as f:
            resource = json.load(f)

            f.close()

            return resource

    @staticmethod
    def update_resource(file_name: str, data):
        with open(f'../resources/{file_name}', 'w') as f:
            json.dump(dict(sorted(data.items())), f, indent=4)
            f.close()

    @staticmethod
    def is_poi(df: DataFrame) -> DataFrame:
        included_tags = Processor.load_resource('includedTags.json')
        excluded_tags = Processor.load_resource('excludedTags.json')

        @udf(returnType=BooleanType())
        def has_poi_tag(tags):
            return \
                len(list(filter((lambda t: t.key in included_tags), tags))) > 0 and \
                len(list(filter((lambda t: t.key in excluded_tags), tags))) < 1

        return df.withColumn('is_poi', has_poi_tag(col('tags')))

    @staticmethod
    def parse_categories(df: DataFrame) -> DataFrame:
        categories = Processor.load_resource('categories.json')
        relevant_category_tags = Processor.load_resource('relevantCategoryTags.json')

        @udf(returnType=ArrayType(StringType()))
        def parse_tags(is_poi, tags):
            if not is_poi:
                return

            result = []

            for tag in tags:
                matched_categories = []

                if tag.key in relevant_category_tags:
                    for c in categories.keys():
                        osm_tag = f'{tag.key}={tag.value}'

                        if osm_tag in categories[c]['tags']:
                            matched_categories.append(categories[c]['category'])

                        # TODO: add osm_tag to misc using a Spark accumulator

                    if matched_categories:
                        result.append(matched_categories)

            if result:
                results_flat = list(itertools.chain(*result))

                return list(dict.fromkeys(results_flat))  # Return with removed duplicates

        return df.withColumn('categories', parse_tags(col('is_poi'), col('tags')))

    @staticmethod
    def parse_single_tag(df: DataFrame, column: str, tag_keys: [str]) -> DataFrame:
        @udf(returnType=StringType())
        def parse_tags(is_poi, tags):
            if not is_poi:
                return

            match = next((t for t in tags if t.key in tag_keys), None)

            if match:
                return match.value

        return df.withColumn(column, parse_tags(col('is_poi'), col('tags')))

    @staticmethod
    def parse_address(df: DataFrame) -> DataFrame:
        relevant_address_tags = Processor.load_resource('relevantAddressTags.json')

        @udf(returnType=StructType([
            StructField('house_nr', StringType()),
            StructField('street', StringType()),
            StructField('zip_code', StringType()),
            StructField('city', StringType()),
            StructField('country', StringType()),
            StructField('full', StringType()),
            StructField('region', StructType([
                StructField('neighborhood', StringType()),  # Area within a suburb or quarter
                StructField('suburb', StringType()),  # An area within commuting distance of a city
                StructField('district', StringType()),  # Administrative division
                StructField('province', StringType()),  # Administrative division
                StructField('state', StringType())  # Administrative division
            ])),
            StructField('house_name', StringType()),  # Sometimes additionally to or instead of house number
            StructField('place', StringType()),  # Territorial zone (e.g., island, square) instead of street
            StructField('block', StringType()),  # In some countries used instead of house number
            StructField('details', StructType([
                StructField('level', StringType()),
                StructField('flats', StringType()),
                StructField('unit', StringType())
            ]))
        ]))
        def parse_tags(is_poi, tags):
            if not is_poi:
                return

            address = dict(region=dict(), details=dict())

            for tag in tags:
                if tag.key in relevant_address_tags:
                    switcher = {
                        'housenumber': ['house_nr'],
                        'street': ['street'],
                        'postcode': ['zip_code'],
                        'city': ['city'],
                        'country': ['country'],
                        'full': ['full'],
                        'neighbourhood': ['region', 'neighborhood'],
                        'suburb': ['region', 'suburb'],
                        'district': ['region', 'district'],
                        'province': ['region', 'province'],
                        'state': ['region', 'state'],
                        'housename': ['house_name'],
                        'place': ['place'],
                        'block': ['block'],
                        'floor': ['details', 'level'],
                        'level': ['details', 'level'],
                        'flats': ['details', 'flats'],
                        'unit': ['details', 'unit']
                    }

                    keys = switcher.get(tag.key.split(':')[1])

                    if keys:
                        if len(keys) < 2:
                            address[keys[0]] = tag.value
                        else:
                            address[keys[0]][keys[1]] = tag.value
                    else:
                        logging.warning(f'Invalid address key: {tag.key}')

            return address

        return df \
            .withColumn('address', parse_tags(col('is_poi'), col('tags'))) \
            .withColumn('address_house_nr', col('address.house_nr')) \
            .withColumn('address_street', col('address.street')) \
            .withColumn('address_zip_code', col('address.zip_code')) \
            .withColumn('address_city', col('address.city')) \
            .withColumn('address_country', col('address.country')) \
            .withColumn('address_full', col('address.full')) \
            .withColumn('address_region_neighborhood', col('address.region.neighborhood')) \
            .withColumn('address_region_suburb', col('address.region.suburb')) \
            .withColumn('address_region_district', col('address.region.district')) \
            .withColumn('address_region_province', col('address.region.province')) \
            .withColumn('address_region_state', col('address.region.state')) \
            .withColumn('address_house_name', col('address.house_name')) \
            .withColumn('address_place', col('address.place')) \
            .withColumn('address_block', col('address.block')) \
            .withColumn('address_details_level', col('address.details.level')) \
            .withColumn('address_details_flats', col('address.details.flats')) \
            .withColumn('address_details_unit', col('address.details.unit')) \
            .drop('address')

    @staticmethod
    def df_parse_tags(file_path, spark, osm_type) -> DataFrame:
        files = os.listdir(file_path + '/parquet/osm_parquetizer')
        file = list(filter(lambda f: (osm_type in f) and ('crc' not in f), files))[0]
        df = spark.read.parquet(f'{file_path}/parquet/osm_parquetizer/{file}')
        df = Processor.is_poi(df)
        df = Processor.parse_categories(df)
        df = Processor.parse_address(df)
        df = df.withColumn('osm_type', lit(osm_type)).withColumnRenamed('id', 'osm_id')
        df = Processor.parse_single_tag(df, 'name', ['name'])
        df = Processor.parse_single_tag(df, 'phone', ['phone'])
        df = Processor.parse_single_tag(df, 'email', ['email'])
        df = Processor.parse_single_tag(df, 'website', ['website', 'url'])
        df = Processor.parse_single_tag(df, 'brand', ['brand'])
        df = Processor.parse_single_tag(df, 'operator', ['operator'])
        df = Processor.parse_single_tag(df, 'boundary', ['boundary'])
        df = Processor.parse_single_tag(df, 'admin_level', ['admin_level']) \
            .withColumn('admin_level', col('admin_level').cast(IntegerType()))
        df = Processor.parse_single_tag(df, 'type', ['type'])

        return df

    @staticmethod
    def df_parse_way_coordinates(df_way) -> DataFrame:
        @udf(returnType=ArrayType(ArrayType(FloatType())))
        def get_coordinates(nodes):
            coordinates = []

            for node in nodes:
                coordinates.append([node['longitude'], node['latitude']])

            if coordinates and len(coordinates) > 1:
                return coordinates

        return df_way.withColumn('coordinates', get_coordinates(col('nodes')))

    @staticmethod
    def df_way_create_geo_json(df_way) -> DataFrame:
        return df_way.withColumn('geo_json', create_geo_json_based_on_coordinates(col('coordinates')))

    @staticmethod
    def get_geo_json_center(df) -> DataFrame:
        return df \
            .filter(col('geo_json').isNotNull()) \
            .withColumn('centroid', get_centroid_of_geo_json(col('geo_json'))) \
            .withColumn('latitude', col('centroid.latitude')) \
            .withColumn('longitude', col('centroid.longitude'))

    @staticmethod
    def df_add_h3_index(df) -> DataFrame:
        return df.withColumn('h3_index', get_h3_index(col('latitude'), col('longitude'), lit(15)))

    @staticmethod
    def combine_pois(df_node, df_way, df_relation) -> DataFrame:
        columns = [
            'osm_type',
            'osm_id',
            'tags',
            'latitude',
            'longitude',
            'h3_index',
            'categories',
            'address_house_nr',
            'address_street',
            'address_zip_code',
            'address_city',
            'address_country',
            'address_full',
            'address_region_neighborhood',
            'address_region_suburb',
            'address_region_district',
            'address_region_province',
            'address_region_state',
            'address_house_name',
            'address_place',
            'address_block',
            'address_details_level',
            'address_details_flats',
            'address_details_unit',
            'name',
            'phone',
            'email',
            'website',
            'brand',
            'operator',
            'boundary',
            'admin_level',
            'type',
            'geo_json'
        ]
        df_node = df_node.withColumn('geo_json', lit(None).cast(NullType()))
        df_node = df_node.filter(col('is_poi') & col('h3_index').isNotNull()).select(columns)
        df_way = df_way.filter(col('is_poi') & col('h3_index').isNotNull()).select(columns)
        df_relation = df_relation.filter(col('is_poi') & col('h3_index').isNotNull()).select(columns)

        return df_node.union(df_way).union(df_relation)

    @staticmethod
    def start(args):
        script_dir = os.path.dirname(__file__)
        directory = os.path.join(script_dir, '../../../tmp/kuwala/osm_files')

        if not args.continent:
            file_path = select_local_osm_file(directory)
        else:
            file_path = f'{directory}/{args.continent}'

            if args.country:
                file_path += f'/{args.country}'

            if args.country_region:
                file_path += f'/{args.country_region}'

        memory = os.getenv('SPARK_MEMORY') or '16g'
        start_time = time.time()
        spark = SparkSession.builder \
            .appName('osm-poi') \
            .config('spark.network.timeout', '1800s') \
            .config('spark.driver.memory', memory) \
            .config('spark.sql.parquet.binaryAsString', 'true') \
            .getOrCreate() \
            .newSession()
        # Parse OSM tags
        df_node = Processor.df_parse_tags(file_path, spark, 'node')
        df_way = Processor.df_parse_tags(file_path, spark, 'way')
        df_relation = Processor.df_parse_tags(file_path, spark, 'relation')
        # Create GeoJSONs
        df_way = Processor.df_parse_way_coordinates(df_way)
        df_way = Processor.df_way_create_geo_json(df_way)

        @udf(returnType=BooleanType())
        def has_polygon_shape(members):
            has_outer = False

            for member in members:
                if member.role == 'outer':
                    has_outer = True

            return has_outer

        geo_jsons_to_fetch = df_relation.filter(
            col('name').isNotNull() &
            has_polygon_shape(col('members')) &
            col('type').isin(['boundary', 'multipolygon'])
        ).withColumn('geo_json', lit(None)).select('osm_id', 'geo_json').toPandas()
        nominatim_controller.get_geo_json_by_id(geo_jsons_to_fetch)
        geo_jsons_to_fetch = spark.createDataFrame(geo_jsons_to_fetch)
        df_relation = df_relation.join(geo_jsons_to_fetch, 'osm_id', 'left')
        df_way = Processor.get_geo_json_center(df_way)
        df_relation = Processor.get_geo_json_center(df_relation)
        # Add H3 index
        df_node = Processor.df_add_h3_index(df_node)
        df_way = Processor.df_add_h3_index(df_way)
        df_relation = Processor.df_add_h3_index(df_relation)
        # Combine all data frames
        df_pois = Processor.combine_pois(df_node, df_way, df_relation)

        df_pois.write.mode('overwrite').parquet(file_path + '/parquet/kuwala.parquet')

        end_time = time.time()

        logging.info(f'Processed OSM files in {round(end_time - start_time)} s')
