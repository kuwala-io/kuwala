import h3
import os
import pycountry
import questionary
import time
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import lit


def add_population(df: DataFrame):
    query = '''
        MERGE (h:H3Index { h3Index: event.h3Index, resolution: event.resolution }) 
        WITH h, event
        MERGE (p:Population)-[:POPULATION_AT]->(h)
        WITH p, event
        SET
            p.total = CASE WHEN event.total IS NOT NULL THEN event.total ELSE 'null' END,
            p.women = CASE WHEN event.women IS NOT NULL THEN event.women ELSE 'null' END,
            p.men = CASE WHEN event.men IS NOT NULL THEN event.men ELSE 'null' END,
            p.children_under_five = 
                CASE WHEN event.children_under_five IS NOT NULL 
                THEN event.children_under_five ELSE 'null' END,
            p.youth_15_24 = CASE WHEN event.youth_15_24 IS NOT NULL THEN event.youth_15_24 ELSE 'null' END,
            p.elderly_60_plus = CASE WHEN event.elderly_60_plus IS NOT NULL THEN event.elderly_60_plus ELSE 'null' END,
            p.women_of_reproductive_age_15_49 = 
                CASE WHEN event.women_of_reproductive_age_15_49 IS NOT NULL 
                THEN event.women_of_reproductive_age_15_49 ELSE 'null' END
    '''
    url = os.getenv('NEO4J_HOST') or 'bolt://localhost:7687'

    # The following error will be printed:
    #
    #   ERROR SchemaService: Query not compiled because of the following exception:
    #   org.neo4j.driver.exceptions.ClientException: Variable `event` not defined (line 2, column 29 (offset: 71))
    #   "MATCH (h:H3Index { h3Index: event.h3Index })"
    #
    # The error can be ignored and everything runs correctly as discussed here:
    # https://github.com/neo4j-contrib/neo4j-spark-connector/issues/357
    # The issue is fixed but not available for the PySpark packages yet:
    # https://spark-packages.org/package/neo4j-contrib/neo4j-connector-apache-spark_2.12
    df.write \
        .format('org.neo4j.spark.DataSource') \
        .mode('Overwrite') \
        .option('url', url) \
        .option('authentication.type', 'basic') \
        .option('authentication.basic.username', 'neo4j') \
        .option('authentication.basic.password', 'password') \
        .option('query', query) \
        .save()


def import_population_density(limit=None):
    script_dir = os.path.dirname(__file__)
    country_dir = os.path.join(script_dir, '../tmp/kuwala/populationFiles/')
    countries = os.listdir(country_dir) if os.path.exists(country_dir) else []

    if len(countries) < 1:
        print('No population data available. You first need to run the population-density processing pipeline before '
              'loading it into the graph')

        return

    country_names = list(map(lambda c: pycountry.countries.get(alpha_3=c).name, countries))
    country = questionary \
        .select('For which country do you want to ingest the population data?', choices=country_names) \
        .ask()
    start_time = time.time()
    spark = SparkSession.builder \
        .appName('neo4j_importer_population-density') \
        .getOrCreate() \
        .newSession()
    df = spark.read.parquet(f'{country_dir}{countries[country_names.index(country)]}/result.parquet')

    # noinspection PyUnresolvedReferences
    resolution = h3.h3_get_resolution(df.first()['h3Index'])
    df = df.withColumn('resolution', lit(resolution))
    df = df.fillna(0)

    if limit is not None:
        df = df.limit(limit)

    add_population(df)

    end_time = time.time()

    print(f'Imported population data in {round(end_time - start_time)} s')
