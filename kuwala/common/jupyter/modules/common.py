import geojson
import h3
from pyspark.sql import SparkSession


def get_spark_session(memory_in_gb):
    return SparkSession \
        .builder \
        .appName('jupyter') \
        .config('spark.driver.memory', f'{memory_in_gb}g') \
        .config('spark.jars.packages', 'neo4j-contrib:neo4j-connector-apache-spark_2.12:4.0.1_for_spark_3') \
        .getOrCreate()


def polyfill_polygon(polygon: geojson.Polygon, resolution):
    # noinspection PyUnresolvedReferences
    h3_indexes = h3.polyfill(dict(type=polygon.type, coordinates=polygon.coordinates),
                             resolution,
                             geo_json_conformant=True)

    return h3_indexes
