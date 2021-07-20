import h3
from functools import reduce
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum, udf
from pyspark.sql.types import DoubleType, StringType

DEFAULT_RESOLUTION = 11


class Processor:
    @staticmethod
    @udf(returnType=StringType())
    def get_h3_index(lat: str, lng: str):
        return h3.geo_to_h3(float(lat), float(lng), DEFAULT_RESOLUTION)

    @staticmethod
    def start(files: [dict], output_dir: str):
        dfs = list()
        spark = SparkSession.builder.appName('population-density').getOrCreate().newSession()

        for file in files:
            t = file['type']
            df = spark.read.option('header', 'true').csv(file['path'])
            df = df \
                .withColumnRenamed(df.columns[2], t) \
                .withColumn(t, col(t).cast(DoubleType())) \
                .withColumn('h3Index', Processor.get_h3_index(col('latitude'), col('longitude'))) \
                .drop('latitude', 'longitude') \
                .groupBy('h3Index') \
                .agg(sum(t).alias(t))

            dfs.append(df)

        df = reduce((lambda d1, d2: d1.join(d2, ['h3Index'], 'full')), dfs)

        df.write.parquet(output_dir + 'result.parquet')
