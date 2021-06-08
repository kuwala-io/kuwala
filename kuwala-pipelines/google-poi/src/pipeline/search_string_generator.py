from pyspark.sql import SparkSession
from pyspark.sql.functions import array_contains, col, concat_ws, lit


def connect_to_mongo(database, collection):
    mongo_url = f'mongodb://127.0.0.1:27017/{database}.{collection}'

    return SparkSession \
        .builder \
        .appName('osmPoi') \
        .config('spark.mongodb.input.uri', mongo_url) \
        .config('spark.jars.packages', 'org.mongodb.spark:mongo-spark-connector_2.12:3.0.1') \
        .getOrCreate()


def generate_search_strings():
    spark = connect_to_mongo('osm-poi', 'pois')
    df = spark.read.format('com.mongodb.spark.sql.DefaultSource').load()
    df = df.filter(df.address.isNotNull()).select('name', 'h3Index', 'address.*', 'categories')
    with_public_transport = df \
        .filter(array_contains('categories', 'public_transportation')) \
        .withColumn('station', concat_ws(' ', col('name'), lit('station'))) \
        .withColumn(
            'searchString',
            concat_ws(', ', col('station'), concat_ws(' ', col('street'), col('houseNr')), col('zipCode'), col('city'))
        ) \
        .select('h3Index', 'searchString')
    with_address = df \
        .filter(~array_contains('categories', 'public_transportation')) \
        .withColumn(
            'searchString',
            concat_ws(', ', col('name'), concat_ws(' ', col('street'), col('houseNr')), col('zipCode'), col('city'))
            if 'full' not in df.columns else
            concat_ws(', ', col('name'), col('full'))
        ) \
        .select('h3Index', 'searchString')

    return with_public_transport.union(with_address)
