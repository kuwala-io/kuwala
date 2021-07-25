import os
from pyspark.sql import SparkSession

if __name__ == '__main__':
    spark = SparkSession.builder.appName('osm-poi').getOrCreate().newSession()
    script_dir = os.path.dirname(__file__)
    parquet_files = os.path.join(script_dir, '../tmp/osmFiles/parquet/')
    df = spark.read.parquet(parquet_files + 'europe/malta-latest/malta-latest.osm.pbf.relation.parquet')
    df.show(truncate=False)
