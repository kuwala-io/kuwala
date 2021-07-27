import json
import os
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, udf
from pyspark.sql.types import BooleanType


class Processor:
    @staticmethod
    def load_tags(t: str):
        with open(f'../resources/{t}Tags.json') as f:
            return json.load(f)

    @staticmethod
    def start():
        script_dir = os.path.dirname(__file__)
        parquet_files = os.path.join(script_dir, '../tmp/osmFiles/parquet/')
        included_tags = Processor.load_tags('included')
        excluded_tags = Processor.load_tags('excluded')
        spark = SparkSession.builder \
            .appName('osm-poi') \
            .config('spark.sql.parquet.binaryAsString', 'true') \
            .getOrCreate() \
            .newSession()
        df = spark.read.parquet(parquet_files + 'europe/malta-latest/malta-latest.osm.pbf.node.parquet')

        @udf(returnType=BooleanType())
        def filter_by_tags(tags):
            return \
                len(list(filter((lambda t: t.key in included_tags), tags))) > 0 and \
                len(list(filter((lambda t: t.key in excluded_tags), tags))) < 1

        df = df.filter(filter_by_tags(col('tags')))

        df.show(truncate=False)
