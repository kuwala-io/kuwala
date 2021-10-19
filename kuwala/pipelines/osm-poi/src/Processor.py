import itertools
import json
import nominatim_controller
import os
import time
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import coalesce, col, explode, lit, udf
from pyspark.sql.types import \
    ArrayType, BooleanType, FloatType, IntegerType, NullType, StringType, StructField, StructType
from python_utils.src.FileSelector import select_local_osm_file
from python_utils.src.spark_udfs import create_geo_json_based_on_coordinates, get_centroid_of_geo_json, get_h3_index
from shapely.geometry import shape

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
                        print(f'Invalid address key: {tag.key}')

            return address

        return df.withColumn('address', parse_tags(col('is_poi'), col('tags')))

    @staticmethod
    def df_parse_tags(file_path, spark, osm_type) -> DataFrame:
        files = os.listdir(file_path + '/osm-parquetizer')
        file = list(filter(lambda f: (osm_type in f) and ('crc' not in f), files))[0]
        df = spark.read.parquet(f'{file_path}/osm-parquetizer/{file}')
        df = Processor.is_poi(df)
        df = Processor.parse_categories(df)
        df = Processor.parse_address(df)
        df = df.withColumn('osm_type', lit(osm_type))
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
    def df_mark_relation_members(spark, df_way, df_relation) -> DataFrame:
        df_members = df_relation.withColumn('members', explode('members')).select('members.*').select('id', 'type') \
            .sort('id')
        dict_way_members = df_members.filter(col('type') == 'Way').select('id').distinct().toPandas() \
            .set_index('id').T.to_dict('list')
        dict_way_members = spark.sparkContext.broadcast(dict_way_members)

        del df_members

        @udf(returnType=BooleanType())
        def is_relation_member(osm_id):
            def is_in_df(broadcast, oid):
                try:
                    # noinspection PyComparisonWithNone
                    return broadcast.value[oid] != None
                except KeyError:
                    return False

            return is_in_df(dict_way_members, osm_id)

        df_way = df_way.withColumn('is_relation_member', is_relation_member(col('id')))

        return df_way

    @staticmethod
    def df_way_create_geo_json(df_way) -> DataFrame:
        return df_way.withColumn('geo_json', create_geo_json_based_on_coordinates(col('coordinates')))

    @staticmethod
    def get_geo_json_center(df) -> DataFrame:
        return df \
            .withColumn('centroid', get_centroid_of_geo_json(col('geo_json'))) \
            .withColumn('latitude', col('centroid.latitude')) \
            .withColumn('longitude', col('centroid.longitude'))

    @staticmethod
    def df_relation_create_geo_json(spark, df_relation, df_way) -> DataFrame:
        dict_way_members = df_way.filter(col('is_relation_member')).select('id', 'coordinates').sort('id').toPandas() \
            .set_index('id').T.to_dict('list')
        dict_way_members = spark.sparkContext.broadcast(dict_way_members)

        @udf(returnType=StringType())
        def create_geo_json(relation_type, members):
            if relation_type not in ['boundary', 'multipolygon']:
                return

            member_coordinates = []  # [[[[lng, lat]]]]
            outer_members = list(filter(lambda m: m.role == 'outer', members))

            for member in outer_members:
                try:
                    member_coordinates.append(dict_way_members.value[member.id])
                except KeyError:
                    continue

            geo_json_coordinates = []
            joined_member = None

            for index, member in enumerate(member_coordinates):
                if index == 0:
                    joined_member = member
                    continue

                first_coordinates_joined = joined_member[0][0]
                last_coordinates_joined = list(reversed(joined_member[0]))[0]
                first_coordinates_new = member[0][0]
                last_coordinates_new = list(reversed(member[0]))[0]
                first_lat_joined = first_coordinates_joined[1]
                first_lng_joined = first_coordinates_joined[0]
                last_lat_joined = last_coordinates_joined[1]
                last_lng_joined = last_coordinates_joined[0]
                first_lat_new = first_coordinates_new[1]
                first_lng_new = first_coordinates_new[0]
                last_lat_new = last_coordinates_new[1]
                last_lng_new = last_coordinates_new[0]

                if last_lat_joined == first_lat_new and last_lng_joined == first_lng_new:
                    joined_member[0] += member[0]
                elif last_lat_joined == last_lat_new and last_lng_joined == last_lng_new:
                    joined_member[0] += list(reversed(member[0]))
                elif first_lat_joined == first_lat_new and first_lng_joined == first_lng_new:
                    joined_member[0] = list(reversed(member[0])) + joined_member[0]
                elif first_lat_joined == last_lat_new and first_lng_joined == last_lng_new:
                    joined_member[0] = member[0] + joined_member[0]
                else:
                    geo_json_coordinates.append(joined_member)

                    joined_member = member

            if joined_member:
                geo_json_coordinates.append(joined_member)

            geo_json = None

            if len(geo_json_coordinates):
                if len(geo_json_coordinates) > 1:
                    geo_json = json.dumps(dict(type='MultiPolygon', coordinates=geo_json_coordinates))
                else:
                    geo_json = json.dumps(dict(type='Polygon', coordinates=geo_json_coordinates[0]))

            try:
                if shape(json.loads(geo_json)).is_valid:
                    return geo_json

                return None
            except ValueError:
                return None

        return df_relation.withColumn('geo_json', create_geo_json(col('type'), col('members')))

    @staticmethod
    def df_add_h3_index(df) -> DataFrame:
        return df.withColumn('h3_index', get_h3_index(col('latitude'), col('longitude'), lit(15)))

    @staticmethod
    def combine_pois(df_node, df_way, df_relation) -> DataFrame:
        columns = [
            'osm_type',
            'id',
            'tags',
            'latitude',
            'longitude',
            'h3_index',
            'categories',
            'address',
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
        directory = os.path.join(script_dir, '../tmp/osmFiles/parquet')

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
        df_way = Processor.df_mark_relation_members(spark, df_way, df_relation)
        df_way = Processor.df_parse_way_coordinates(df_way)
        df_way = Processor.df_way_create_geo_json(df_way)
        df_relation = Processor.df_relation_create_geo_json(spark, df_relation, df_way)

        @udf(returnType=BooleanType())
        def has_polygon_shape(members):
            has_outer = False

            for member in members:
                if member.role == 'outer':
                    has_outer = True

            return has_outer

        geo_jsons_to_fetch = df_relation \
            .filter(col('geo_json').isNull() & col('name').isNotNull() & has_polygon_shape(col('members'))) \
            .select('id', 'geo_json').toPandas()
        nominatim_controller.get_geo_json_by_id(geo_jsons_to_fetch)
        geo_jsons_to_fetch = spark.createDataFrame(geo_jsons_to_fetch).withColumnRenamed('geo_json', 'geo_json_fetched')
        df_relation = df_relation.join(geo_jsons_to_fetch, 'id', 'left') \
            .withColumn('geo_json', coalesce('geo_json_fetched', 'geo_json'))
        df_way = Processor.get_geo_json_center(df_way)
        df_relation = Processor.get_geo_json_center(df_relation)
        # Add H3 index
        df_node = Processor.df_add_h3_index(df_node)
        df_way = Processor.df_add_h3_index(df_way)
        df_relation = Processor.df_add_h3_index(df_relation)
        # Combine all data frames
        df_pois = Processor.combine_pois(df_node, df_way, df_relation)

        df_pois.write.mode('overwrite').parquet(file_path + '/kuwala.parquet')

        end_time = time.time()

        print(f'Processed OSM files in {round(end_time - start_time)} s')
