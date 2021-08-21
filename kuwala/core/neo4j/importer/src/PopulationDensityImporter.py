import h3
import Neo4jConnection as Neo4jConnection
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

    Neo4jConnection.write_df_to_neo4j_with_override(df, query)


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
