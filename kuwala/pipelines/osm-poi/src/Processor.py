import itertools
import json
import os
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import col, udf
from pyspark.sql.types import ArrayType, BooleanType, StringType, StructField, StructType


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
    def filter_tags(df: DataFrame) -> DataFrame:
        included_tags = Processor.load_resource('includedTags.json')
        excluded_tags = Processor.load_resource('excludedTags.json')

        @udf(returnType=BooleanType())
        def filter_by_tags(tags):
            return \
                len(list(filter((lambda t: t.key in included_tags), tags))) > 0 and \
                len(list(filter((lambda t: t.key in excluded_tags), tags))) < 1

        return df.filter(filter_by_tags(col('tags')))

    @staticmethod
    def parse_categories(df: DataFrame) -> DataFrame:
        categories = Processor.load_resource('categories.json')
        relevant_category_tags = Processor.load_resource('relevantCategoryTags.json')

        @udf(returnType=ArrayType(StringType()))
        def parse_tags(tags):
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

        return df.withColumn('categories', parse_tags(col('tags')))

    @staticmethod
    def parse_single_tag(df: DataFrame, column: str, tag_keys: [str]) -> DataFrame:
        @udf(returnType=StringType())
        def parse_tags(tags):
            match = next((t for t in tags if t.key in tag_keys), None)

            if match:
                return match.value

        return df.withColumn(column, parse_tags(col('tags')))

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
        def parse_tags(tags):
            address = dict(region=None, details=None)

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

        return df.withColumn('address', parse_tags(col('tags')))

    @staticmethod
    def start():
        script_dir = os.path.dirname(__file__)
        parquet_files = os.path.join(script_dir, '../tmp/osmFiles/parquet/')
        spark = SparkSession.builder \
            .appName('osm-poi') \
            .config('spark.sql.parquet.binaryAsString', 'true') \
            .getOrCreate() \
            .newSession()
        df = spark.read.parquet(parquet_files + 'europe/malta-latest/malta-latest.osm.pbf.way.parquet')
        df = Processor.filter_tags(df)
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

        df.where(col('admin_level').isNotNull()).show(n=20, truncate=True)
