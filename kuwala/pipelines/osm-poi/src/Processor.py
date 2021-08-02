import itertools
import json
import os
import time
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import col, explode, lit, udf
from pyspark.sql.types import ArrayType, BooleanType, FloatType, StringType, StructField, StructType


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
    def df_parse_tags(parquet_files, spark, osm_type) -> DataFrame:
        df = spark.read.parquet(f'{parquet_files}europe/malta-latest/malta-latest.osm.pbf.{osm_type}.parquet')
        df = Processor.is_poi(df)
        df = Processor.parse_categories(df)
        df = Processor.parse_address(df)
        df = Processor.parse_single_tag(df, 'name', ['name'])
        df = Processor.parse_single_tag(df, 'phone', ['phone'])
        df = Processor.parse_single_tag(df, 'email', ['email'])
        df = Processor.parse_single_tag(df, 'website', ['website', 'url'])
        df = Processor.parse_single_tag(df, 'brand', ['brand'])
        df = Processor.parse_single_tag(df, 'operator', ['operator'])
        df = Processor.parse_single_tag(df, 'boundary', ['boundary'])
        df = Processor.parse_single_tag(df, 'admin_level', ['admin_level'])
        df = Processor.parse_single_tag(df, 'type', ['type'])

        return df

    @staticmethod
    def df_parse_way_coordinates(spark, df_node, df_way) -> DataFrame:
        pd_coordinates = df_node.filter(col('is_poi') == False).select('id', 'latitude', 'longitude').sort(
            'id').toPandas()
        dict_coordinates = pd_coordinates.set_index('id').T.to_dict('list')
        dict_coordinates = spark.sparkContext.broadcast(dict_coordinates)

        del pd_coordinates

        @udf(returnType=ArrayType(ArrayType(FloatType())))
        def get_coordinates(is_poi, is_relation_member, nodes):
            if not (is_poi or is_relation_member):
                return

            coordinates = []

            for node in nodes:
                # node_pd = df_node_broadcast.value.loc[df_node_broadcast.value['id'] == node['nodeId']]
                try:
                    coords = dict_coordinates.value[node['nodeId']]
                except KeyError:
                    continue

                if coords:
                    coordinates.append([coords[1], coords[0]])

            if coordinates and len(coordinates) > 1:
                return coordinates

        return df_way.withColumn('coordinates', get_coordinates(col('is_poi'), col('is_relation_member'), col('nodes')))

    @staticmethod
    def df_mark_relation_members(spark, df_node, df_way, df_relation) -> [DataFrame, DataFrame]:
        df_members = df_relation.withColumn('members', explode('members')).select('members.*').select('id', 'type') \
            .sort('id')
        dict_node_members = df_members.filter(col('type') == 'Node').select('id').toPandas().set_index('id').T \
            .to_dict('list')
        dict_node_members = spark.sparkContext.broadcast(dict_node_members)
        dict_way_members = df_members.filter(col('type') == 'Way').select('id').toPandas().set_index('id').T \
            .to_dict('list')
        dict_way_members = spark.sparkContext.broadcast(dict_way_members)

        del df_members

        @udf(returnType=BooleanType())
        def is_relation_member(osm_type, osm_id):
            def is_in_df(broadcast, oid):
                try:
                    # noinspection PyComparisonWithNone
                    return broadcast.value[oid] != None
                except KeyError:
                    return False

            return is_in_df(dict_node_members if osm_type == 'node' else dict_way_members, osm_id)

        df_node = df_node.withColumn('is_relation_member', is_relation_member(lit('node'), col('id')))
        df_way = df_way.withColumn('is_relation_member', is_relation_member(lit('way'), col('id')))

        return df_node, df_way

    @staticmethod
    def df_way_create_geo_json(df_way) -> DataFrame:
        @udf(returnType=StringType())
        def create_geo_json(is_relation_member, coordinates):
            if is_relation_member or not coordinates:
                return

            last_index = len(coordinates) - 1
            geo_json_type = 'Polygon'

            if (coordinates[0][0] != coordinates[last_index][0]) or (coordinates[0][1] != coordinates[last_index][1]):
                geo_json_type = 'LineString'

            geo_json_coordinates = [coordinates] if geo_json_type == 'Polygon' else coordinates

            return json.dumps(dict(type=geo_json_type, coordinates=geo_json_coordinates))

        return df_way.withColumn('geo_json', create_geo_json(col('is_relation_member'), col('coordinates')))

    @staticmethod
    def df_relation_create_geo_json(spark, df_relation, df_way) -> DataFrame:
        dict_way_members = df_way.filter(col('is_relation_member')).select('id', 'coordinates').sort('id').toPandas() \
            .set_index('id').T.to_dict('list')
        dict_way_members = spark.sparkContext.broadcast(dict_way_members)

        @udf(returnType=StringType())
        def create_geo_json(relation_type, members):
            if relation_type not in ['boundary', 'multipolygon']:
                return

            geo_json_coordinates = []  # [[[[lng, lat]]]]

            for member in members:
                if member.role == 'outer':
                    try:
                        coordinates = dict_way_members.value[member.id][0]  # [[lng, lat]]
                    except KeyError:
                        continue

                    if not coordinates:
                        continue

                    if len(geo_json_coordinates) < 1:
                        geo_json_coordinates.append([coordinates])
                    else:
                        last_index_geo_json = len(geo_json_coordinates) - 1
                        last_index_coordinate_pair = len(geo_json_coordinates[last_index_geo_json][0]) - 1
                        last_coordinate_pair = geo_json_coordinates[last_index_geo_json][0][last_index_coordinate_pair]

                        if last_coordinate_pair[0] == coordinates[0][0] and \
                                last_coordinate_pair[1] == coordinates[0][1]:
                            geo_json_coordinates[last_index_geo_json].append(coordinates)
                        # Check if coordinates in reversed order fit
                        elif last_coordinate_pair[0] == list(reversed(coordinates))[0][0] and \
                                last_coordinate_pair[1] == list(reversed(coordinates))[0][1]:
                            geo_json_coordinates[last_index_geo_json].append(list(reversed(coordinates)))
                        else:
                            geo_json_coordinates.append([coordinates])

            if geo_json_coordinates:
                return json.dumps(dict(type='MultiPolygon', coordinates=geo_json_coordinates))

        return df_relation.withColumn('geo_json', create_geo_json(col('type'), col('members')))

    @staticmethod
    def start():
        start_time = time.time()
        script_dir = os.path.dirname(__file__)
        parquet_files = os.path.join(script_dir, '../tmp/osmFiles/parquet/')
        spark = SparkSession.builder \
            .appName('osm-poi') \
            .config('spark.driver.memory', '16g') \
            .config('spark.sql.parquet.binaryAsString', 'true') \
            .getOrCreate() \
            .newSession()
        df_node = Processor.df_parse_tags(parquet_files, spark, 'node')
        df_way = Processor.df_parse_tags(parquet_files, spark, 'way')
        df_relation = Processor.df_parse_tags(parquet_files, spark, 'relation')
        df_node, df_way = Processor.df_mark_relation_members(spark, df_node, df_way, df_relation)
        df_way = Processor.df_parse_way_coordinates(spark, df_node, df_way)
        df_way = Processor.df_way_create_geo_json(df_way)
        df_relation = Processor.df_relation_create_geo_json(spark, df_relation, df_way)

        pd_geo = df_relation.filter(col('admin_level').isNotNull()).select('id', 'admin_level',
                                                                           'geo_json').toPandas().to_dict('records')
        json_file = open('tmp_geo.json', 'w')
        json_file.write(json.dumps(pd_geo))
        json_file.close()

        end_time = time.time()

        print(f'Processed OSM files in {round(end_time - start_time)} s')
