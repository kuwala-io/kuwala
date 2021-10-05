import math
import os
import time
from functools import reduce
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lit, sum
from pyspark.sql.types import DoubleType
from python_utils.src.spark_udfs import get_h3_index


class Processor:
    @staticmethod
    def start(files: [dict], output_dir: str):
        memory = os.getenv('SPARK_MEMORY') or '16g'
        start_time = time.time()
        dfs = list()
        spark = SparkSession.builder \
            .appName('population-density') \
            .config('spark.driver.memory', memory) \
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
                .withColumn('h3Index', get_h3_index(col(lat_column), col(lng_column), lit(11))) \
                .drop(lat_column, lng_column) \
                .groupBy('h3Index') \
                .agg(sum(t).alias(t))

            dfs.append(df)

        df = reduce((lambda d1, d2: d1.join(d2, ['h3Index'], 'full').repartition(number_of_partitions, 'h3Index')), dfs)

        df.write.mode('overwrite').parquet(output_dir + 'result.parquet')

        end_time = time.time()

        print(f'Processed files in {round(end_time - start_time)} s')
