import math
import h3
import os
import time
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
        start_time = time.time()
        dfs = list()
        spark = SparkSession.builder \
            .appName('population-density') \
            .config('spark.driver.memory', '16g') \
            .getOrCreate() \
            .newSession()

        total_file_size_in_mb = reduce(
            lambda x, y: x + y,
            map(lambda f: os.path.getsize(f['path'] + os.listdir(f['path'])[0]) / math.pow(1024, 2), files)
        )
        # Optimal partition size is 128MB (https://gist.github.com/dusenberrymw/30cebf98263fae206ea0ffd2cb155813)
        number_of_partitions = math.ceil(total_file_size_in_mb / (len(files) * 128))

        for file in files:
            t = file['type']
            df = spark.read.option('header', 'true').csv(file['path'])
            # Column names can be written differently for different countries
            lat_column = next((c for c in df.columns if 'lat' in c.lower()), 'latitude')
            lng_column = next((c for c in df.columns if 'lon' in c.lower()), 'longitude')
            df = df.repartition(number_of_partitions, lat_column, lng_column)
            df = df \
                .withColumnRenamed(df.columns[2], t) \
                .withColumn(t, col(t).cast(DoubleType())) \
                .withColumn('h3Index', Processor.get_h3_index(col(lat_column), col(lng_column))) \
                .drop(lat_column, lng_column) \
                .groupBy('h3Index') \
                .agg(sum(t).alias(t))

            dfs.append(df)

        df = reduce((lambda d1, d2: d1.join(d2, ['h3Index'], 'full').repartition(number_of_partitions, 'h3Index')), dfs)

        df.write.mode('overwrite').parquet(output_dir + 'result.parquet')

        end_time = time.time()

        print(f'Processed files in {round(end_time - start_time)} s')
