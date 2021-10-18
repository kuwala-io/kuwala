import geojson
import h3
from pyspark.ml.feature import MinMaxScaler
from pyspark.ml.feature import VectorAssembler
from pyspark.ml import Pipeline
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lit, udf
from pyspark.sql.types import DoubleType, StringType


# Create a Spark session that is use to query and transform data from the database
def get_spark_session(memory_in_gb):
    return SparkSession \
        .builder \
        .appName('jupyter') \
        .config('spark.driver.memory', f'{memory_in_gb}g') \
        .config('spark.jars.packages', 'neo4j-contrib:neo4j-connector-apache-spark_2.12:4.0.1_for_spark_3') \
        .getOrCreate()


# Get all the H3 indexes inside a polygon
def polyfill_polygon(polygon: geojson.Polygon, resolution):
    # noinspection PyUnresolvedReferences
    h3_indexes = h3.polyfill(dict(type=polygon.type, coordinates=polygon.coordinates),
                             resolution,
                             geo_json_conformant=True)

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

    return df.withColumn('h3_index', get_h3_index(col(lat_column), col(lng_column), lit(resolution)))


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
        df = pipeline.fit(df).transform(df).withColumn(i + "_scaled", unlist(i + "_scaled")).drop(i + "_vect")

    return df
