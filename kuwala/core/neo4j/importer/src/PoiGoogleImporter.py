import h3
import moment
import os
import Neo4jConnection as Neo4jConnection
import time
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import col, concat_ws, explode, lit


def add_constraints():
    Neo4jConnection.connect_to_graph()
    Neo4jConnection.query_graph('CREATE CONSTRAINT poiGoogle IF NOT EXISTS ON (p:PoiGoogle) ASSERT p.id IS UNIQUE')
    Neo4jConnection.query_graph('CREATE CONSTRAINT poiOpeningHours IF NOT EXISTS ON (p:PoiOpeningHours) ASSERT (p.id) '
                                'IS UNIQUE')
    Neo4jConnection.query_graph('CREATE CONSTRAINT poiRating IF NOT EXISTS ON (p:PoiRating) ASSERT p.value IS UNIQUE')
    Neo4jConnection.query_graph('CREATE CONSTRAINT poiPriceLevel IF NOT EXISTS ON (p:PoiPriceLevel) ASSERT p.value IS '
                                'UNIQUE')
    Neo4jConnection.query_graph('CREATE CONSTRAINT poiWaitingTime IF NOT EXISTS ON (p:PoiWaitingTime) ASSERT p.value '
                                'IS UNIQUE')
    Neo4jConnection.query_graph('CREATE CONSTRAINT poiSpendingTime IF NOT EXISTS ON (p:PoiSpendingTime) ASSERT p.id '
                                'IS UNIQUE')
    Neo4jConnection.close_connection()


def add_google_pois(df: DataFrame):
    query = '''
        // Create PoiGoogle nodes
        MERGE (pg:PoiGoogle { id: event.id })
        ON CREATE SET 
            pg.placeId = event.placeID,
            pg.name = event.name,
            pg.address = event.address,
            pg.phone = event.phone,
            pg.website = event.website,
            pg.timezone = event.timezone

        // Create H3 index nodes
        WITH event, pg
        MERGE (h:H3Index { h3Index: event.h3Index })
        ON CREATE SET h.resolution = event.resolution
        MERGE (pg)-[:LOCATED_AT]->(h)
        
        // Create relationship to PoiCategories
        WITH event, pg
        MATCH (pc:PoiCategory) 
        WHERE pc.name IN event.categories
        MERGE (pg)-[:BELONGS_TO]->(pc)
    '''

    Neo4jConnection.spark_send_query(df, query)


def add_opening_hours(df: DataFrame):
    query = '''
        // Create opening hours and relate them to PoiGoogle nodes
        MATCH (pg:PoiGoogle { id: event.id })
        WITH pg, event
        MERGE (poh:PoiOpeningHours { id: event.oh_id })
        ON CREATE SET poh.openingTime = event.openingTime, poh.closingTime = event.closingTime
        MERGE (pg)-[:HAS { date: event.date }]->(poh)
    '''

    Neo4jConnection.spark_send_query(df, query)


def add_closed_tags(df: DataFrame):
    Neo4jConnection.query_graph('''
        MERGE (:PoiClosed { closed: false, permanently: false })
        MERGE (:PoiClosed { closed: true, permanently: false })
        MERGE (:PoiClosed { closed: true, permanently: true })
    ''')

    query = '''
        MATCH (pg:PoiGoogle { id: event.id })
        MATCH (pc:PoiClosed)
        WHERE pc.closed = 
            (event.permanentlyClosed OR event.temporarilyClosed) AND 
            pc.permanently = event.permanentlyClosed
        MERGE (pg)-[:IS { date: event.date }]->(pc)
    '''

    Neo4jConnection.spark_send_query(df, query)


def add_ratings(df: DataFrame):
    query = '''
        MATCH (pg:PoiGoogle { id: event.id })
        MERGE (pr:PoiRating { value: event.stars })
        MERGE (pg)-[:HAS { numberOfReviews: event.numberOfReviews, date: event.date }]->(pr)
    '''

    Neo4jConnection.spark_send_query(df, query)


def add_price_levels(df: DataFrame):
    query = '''
        MATCH (pg:PoiGoogle { id: event.id })
        MERGE (ppl:PoiPriceLevel { value: event.priceLevel })
        MERGE (pg)-[:HAS { date: event.date }]->(ppl)
    '''

    Neo4jConnection.spark_send_query(df, query)


def add_popularities(df: DataFrame):
    query = '''
        MATCH (pg:PoiGoogle { id: event.id })
        MERGE (pg)-[:HAS { timestamp: event.timestamp }]->(:PoiPopularityAverage { value: event.popularity })
    '''

    Neo4jConnection.spark_send_query(df, query)


def add_waiting_times(df: DataFrame):
    query = '''
        MATCH (pg:PoiGoogle { id: event.id })
        MERGE (pwt:PoiWaitingTime { value: event.waitingTime })
        MERGE (pg)-[:HAS { timestamp: event.timestamp }]->(pwt)
    '''

    Neo4jConnection.spark_send_query(df, query)


def add_spending_times(df: DataFrame):
    query = '''
        MATCH (pg:PoiGoogle { id: event.id })
        MERGE (pst:PoiSpendingTime { id: event.st_id })
        ON CREATE SET pst.min = event.minSpendingTime, pst.max = event.maxSpendingTime
        MERGE (pg)-[:HAS { date: event.date }]->(pst)
    '''

    Neo4jConnection.spark_send_query(df, query)


def import_pois_google(limit=None):
    script_dir = os.path.dirname(__file__)
    directory = os.path.join(script_dir, '../tmp/kuwala/googleFiles/poiData/')
    parquet_files = sorted(list(filter(lambda f: 'matched' in f, os.listdir(directory))), reverse=True)

    if len(parquet_files) < 1:
        print('No Google POI data available. You first need to run the google-poi processing pipeline before loading '
              'it into the graph')

        return

    file_path = directory + parquet_files[0]
    start_time = time.time()

    add_constraints()

    spark = SparkSession.builder.appName('neo4j_importer_google-poi').getOrCreate().newSession()
    df = spark.read.parquet(file_path)

    if limit is not None:
        df = df.limit(limit)

    # noinspection PyUnresolvedReferences
    resolution = h3.h3_get_resolution(df.first()['h3Index'])
    time_zone = df.first()['timezone']
    date = moment.utcnow().timezone(time_zone).replace(hours=0, minutes=0, seconds=0)

    google_pois = df \
        .select('id', 'h3Index', 'name', 'placeID', 'categories', 'address', 'timezone', 'contact.*') \
        .withColumn('resolution', lit(resolution)) \
        .withColumn('categories', col('categories.kuwala'))
    opening_hours = df \
        .select('id', 'openingHours') \
        .withColumn('openingHours', explode('openingHours')) \
        .select('id', 'openingHours.*') \
        .filter(col('openingTime').isNotNull() & col('closingTime').isNotNull()) \
        .withColumn('oh_id', concat_ws('_', 'openingTime', 'closingTime'))
    closed_tags = df.select('id', 'permanentlyClosed', 'temporarilyClosed').withColumn('date', lit(str(date)))
    ratings = df.select('id', 'rating.*').filter(col('stars').isNotNull()).withColumn('date', lit(str(date)))
    price_levels = df \
        .select('id', 'priceLevel') \
        .filter(col('priceLevel').isNotNull()) \
        .withColumn('date', lit(str(date)))
    popularities = df \
        .select('id', 'popularity') \
        .withColumn('popularity', explode('popularity')) \
        .select('id', 'popularity.*')
    waiting_times = df \
        .select('id', 'waitingTime') \
        .withColumn('waitingTime', explode('waitingTime')) \
        .select('id', 'waitingTime.*')
    spending_times = df \
        .filter(col('spendingTime').isNotNull()) \
        .withColumn('minSpendingTime', col('spendingTime')[0]) \
        .withColumn('maxSpendingTime', col('spendingTime')[1]) \
        .select('id', 'minSpendingTime', 'maxSpendingTime') \
        .withColumn('date', lit(str(date))) \
        .withColumn('st_id', concat_ws('_', 'minSpendingTime', 'maxSpendingTime'))

    add_google_pois(google_pois)
    add_opening_hours(opening_hours)
    add_closed_tags(closed_tags)
    add_ratings(ratings)
    add_price_levels(price_levels)
    add_popularities(popularities)
    add_waiting_times(waiting_times)
    add_spending_times(spending_times)

    end_time = time.time()

    print(f'Imported Google data in {round(end_time - start_time)} s')

    return df
