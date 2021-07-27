import itertools
import json
import os
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import col, udf
from pyspark.sql.types import ArrayType, BooleanType, StringType


class Processor:
    @staticmethod
    def load_resource(file_name: str):
        with open(f'../resources/{file_name}') as f:
            return json.load(f)

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

        @udf(returnType=ArrayType(StringType()))
        def parse_tags(tags):
            def match_tags(tag):
                matched_categories = []

                for c in categories.keys():
                    if f'{tag.key}={tag.value}' in categories[c]['tags']:
                        matched_categories.append(categories[c]['category'])

                # TODO: Add unmatched tags

                return matched_categories

            result = list(map(lambda t: match_tags(t), tags))
            results_flat = list(itertools.chain(*result))

            return list(dict.fromkeys(results_flat))  # Return with removed duplicates

        return df.withColumn('categories', parse_tags(col('tags')))

    @staticmethod
    def start():
        script_dir = os.path.dirname(__file__)
        parquet_files = os.path.join(script_dir, '../tmp/osmFiles/parquet/')
        spark = SparkSession.builder \
            .appName('osm-poi') \
            .config('spark.sql.parquet.binaryAsString', 'true') \
            .getOrCreate() \
            .newSession()
        df = spark.read.parquet(parquet_files + 'europe/malta-latest/malta-latest.osm.pbf.node.parquet')
        df = Processor.filter_tags(df)
        df = Processor.parse_categories(df)

        df.show(n=200, truncate=False)
