import h3
import Neo4jConnection as Neo4jConnection
import os
import time
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import lit
from python_utils.src.FileSelector import select_local_country


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

    Neo4jConnection.write_df_to_neo4j_with_override(df.sort('h3Index'), query)


def import_population_density(args, limit=None):
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, '../tmp/kuwala/populationFiles/')
    continent = args.continent
    country = args.country
    date = args.population_density_date 
    date = str(date).replace('-','_')

    if continent is None or country is None:
        try:
            file_path = select_local_country(file_path)
            file_path += '/'+ date +'_result.parquet' 
        except FileNotFoundError:
            print('No population data available for import')

            return
    else: 
        file_path += f'{continent}/{country}/{date}_result.parquet'

    if not os.path.exists(file_path):
        print('No population data available for import')

        return

    start_time = time.time()
    spark = SparkSession.builder \
        .appName('neo4j_importer_population-density') \
        .getOrCreate() \
        .newSession()
    df = spark.read.parquet(file_path)

    # noinspection PyUnresolvedReferences
    resolution = h3.h3_get_resolution(df.first()['h3Index'])
    df = df.withColumn('resolution', lit(resolution))
    df = df.fillna(0)

    if limit is not None:
        df = df.limit(limit)

    add_population(df)

    end_time = time.time()

    print(f'Imported population data in {round(end_time - start_time)} s')
