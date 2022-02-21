import os
import re

import geojson
import h3
from pyspark.ml import Pipeline
from pyspark.ml.feature import MinMaxScaler, VectorAssembler
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lit, udf
from pyspark.sql.types import DoubleType, StringType

from kuwala.dbt.src.controller.kuwala_dbt_controller import KuwalaDbtController


def get_dbt_controller():
    dbt_host = os.getenv("DBT_HOST")
    script_dir = os.path.dirname(__file__)
    result_path = os.path.join(script_dir, "../tmp/kuwala/transformer")

    return KuwalaDbtController(
        dbt_path="../dbt/dbt", dbt_host=dbt_host, result_path=result_path
    )


# Create a Spark session that is use to query and transform data from the database
def get_spark_session(memory_in_gb):
    return (
        SparkSession.builder.appName("jupyter")
        .config("spark.driver.memory", f"{memory_in_gb}g")
        .getOrCreate()
    )


# Get all the H3 indexes inside a polygon
def polyfill_polygon(polygon: geojson.Polygon, resolution):
    # noinspection PyUnresolvedReferences
    h3_indexes = h3.polyfill(
        dict(type=polygon.type, coordinates=polygon.coordinates),
        resolution,
        geo_json_conformant=True,
    )

    return h3_indexes


def add_h3_index_column(df, lat_column, lng_column, resolution):
    # Get H3 index for coordinates pair
    @udf(returnType=StringType())
    def get_h3_index(lat: str, lng: str, res):
        try:
            # noinspection PyUnresolvedReferences
            return h3.geo_to_h3(float(lat), float(lng), res)
        except TypeError:
            return None

    return df.withColumn(
        "h3_index", get_h3_index(col(lat_column), col(lng_column), lit(resolution))
    )


# Normalize one or multiple columns using a min-max scaler
def scale_spark_columns(df, columns):
    # UDF for converting column type from vector to double type
    unlist = udf(lambda x: round(float(list(x)[0]), 3), DoubleType())

    # Iterating over columns to be scaled
    for i in columns:
        # VectorAssembler Transformation - Converting column to vector type
        assembler = VectorAssembler(inputCols=[i], outputCol=i + "_vect")
        # MinMaxScaler Transformation
        scaler = MinMaxScaler(inputCol=i + "_vect", outputCol=i + "_scaled")
        # Pipeline of VectorAssembler and MinMaxScaler
        pipeline = Pipeline(stages=[assembler, scaler])
        # Fitting pipeline on dataframe
        df = (
            pipeline.fit(df)
            .transform(df)
            .withColumn(i + "_scaled", unlist(i + "_scaled"))
            .drop(i + "_vect")
        )

    return df


def standardize_colname(df):
    for c in df.columns:
        df = df.withColumnRenamed(c, re.sub("[^a-zA-Z0-9.]", "_", c))
    return df


def to_json(df, nb_name):
    df = standardize_colname(df)
    path = f"../notebooks/output/{nb_name}/result.json"
    df.write.format("json").save(path)


def to_csv(df, nb_name, header=True):
    df = standardize_colname(df)
    path = f"../notebooks/output/{nb_name}/result.csv"
    df.write.csv(path=path, header=header)


def to_parquet(df, nb_name):
    df = standardize_colname(df)
    path = f"../notebooks/output/{nb_name}/result.parquet"
    df.write.parquet(path)
