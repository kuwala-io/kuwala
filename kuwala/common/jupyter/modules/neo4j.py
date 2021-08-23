import geojson
import h3
import json
import os
from geojson import Polygon
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, concat_ws, udf
from pyspark.sql.types import ArrayType, StringType


def polyfill_polygon(polygon: geojson.Polygon, resolution):
    # noinspection PyUnresolvedReferences
    h3_indexes = h3.polyfill(dict(type=polygon.type, coordinates=polygon.coordinates),
                             resolution,
                             geo_json_conformant=True)

    return h3_indexes


@udf(returnType=ArrayType(elementType=StringType()))
def get_coordinates(h3_index):
    # noinspection PyBroadException
    try:
        # noinspection PyUnresolvedReferences
        return h3.h3_to_geo(h3_index)
    except Exception:
        print(f'Invalid H3 index: {h3_index}')

        return ['', '']


def save_pois(sp):
    query = """
        MATCH (po:PoiOSM)-[:BELONGS_TO]->(p:Poi)
        OPTIONAL MATCH (pg:PoiGoogle)-[b:BELONGS_TO]->(p)
        CALL {
            WITH po
            MATCH (po)-[:BELONGS_TO]->(pca:PoiCategory)
            RETURN collect(pca.name) AS poi_categories_osm
        }
        OPTIONAL MATCH (po)-[:LOCATED_AT]->(h1:H3Index)
        OPTIONAL MATCH (pg)-[:IS]->(pcl:PoiClosed)
        OPTIONAL MATCH (pg)-[h2:HAS]->(pr:PoiRating)
        OPTIONAL MATCH (pg)-[:HAS]->(ppl:PoiPriceLevel)
        CALL {
            WITH pg
            MATCH (pg)-[:HAS]->(poh:PoiOpeningHours)
            RETURN CASE WHEN COUNT(poh) > 0
                THEN SUM(io.kuwala.time.durationHours(poh.openingTime, poh.closingTime))
                ELSE null
            END AS poi_opening_time_total
        }
        CALL {
            WITH pg
            MATCH (pg)-[:HAS]->(pop:PoiPopularityAverage)
            RETURN CASE WHEN COUNT(pop) > 0 THEN SUM(pop.value) ELSE null END AS poi_popularity_total
        }
        CALL {
            WITH pg
            MATCH (pg)-[h:HAS]->(pop:PoiPopularityAverage)
            WHERE io.kuwala.time.getHour(h.timestamp) >= 0 AND io.kuwala.time.getHour(h.timestamp) < 10 
            RETURN CASE WHEN COUNT(pop) > 0 THEN SUM(pop.value) ELSE null END AS poi_popularity_morning_total
        }
        CALL {
            WITH pg
            MATCH (pg)-[h:HAS]->(pop:PoiPopularityAverage)
            WHERE io.kuwala.time.getHour(h.timestamp) >= 10 AND io.kuwala.time.getHour(h.timestamp) < 14
            RETURN CASE WHEN COUNT(pop) > 0 THEN SUM(pop.value) ELSE null END AS poi_popularity_noon_total
        }
        CALL {
            WITH pg
            MATCH (pg)-[h:HAS]->(pop:PoiPopularityAverage)
            WHERE io.kuwala.time.getHour(h.timestamp) >= 14 AND io.kuwala.time.getHour(h.timestamp) < 18
            RETURN CASE WHEN COUNT(pop) > 0 THEN SUM(pop.value) ELSE null END AS poi_popularity_afternoon_total
        }
        CALL {
            WITH pg
            MATCH (pg)-[h:HAS]->(pop:PoiPopularityAverage)
            WHERE io.kuwala.time.getHour(h.timestamp) >= 18
            RETURN CASE WHEN COUNT(pop) > 0 THEN SUM(pop.value) ELSE null END AS poi_popularity_evening_total
        }
        CALL {
            WITH h1
            MATCH (pop:Population)-[:POPULATION_AT]->(h3:H3Index)
            WHERE h3.h3Index IN io.kuwala.h3.getNeighborsInRadius(h1.h3Index, 11, 200) 
            RETURN 
                SUM(pop.total) AS area_200_population_total,
                SUM(pop.men) AS area_200_population_men,
                SUM(pop.women) AS area_200_population_women,
                SUM(pop.children_under_five) AS area_200_population_children_under_five,
                SUM(pop.youth_15_24) AS area_200_population_youth_15_24,
                SUM(pop.elderly_60_plus) AS area_200_population_elderly_60_plus,
                SUM(pop.women_of_reproductive_age_15_49) AS area_200_population_women_of_reproductive_age_15_49
        }
        CALL {
            WITH h1
            MATCH (pop:Population)-[:POPULATION_AT]->(h3:H3Index)
            WHERE h3.h3Index IN io.kuwala.h3.getNeighborsInRadius(h1.h3Index, 11, 400) 
            RETURN 
                SUM(pop.total) AS area_400_population_total,
                SUM(pop.men) AS area_400_population_men,
                SUM(pop.women) AS area_400_population_women,
                SUM(pop.children_under_five) AS area_400_population_children_under_five,
                SUM(pop.youth_15_24) AS area_400_population_youth_15_24,
                SUM(pop.elderly_60_plus) AS area_400_population_elderly_60_plus,
                SUM(pop.women_of_reproductive_age_15_49) AS area_400_population_women_of_reproductive_age_15_49
        }
        CALL {
            WITH pg
            MATCH (pg)-[:HAS]->(pst:PoiSpendingTime)
            RETURN (pst.min + pst.max) / 2 AS poi_spending_time
        }
        CALL {
            WITH pg
            MATCH (pg)-[:HAS]->(pwt:PoiWaitingTime)
            RETURN CASE WHEN COUNT(pwt) > 0 THEN SUM(pwt.value) ELSE null END AS poi_waiting_time
        }
        CALL {
            WITH pg
            MATCH (pg)-[:INSIDE_OF]->(p:Poi)
            RETURN p.id AS poi_inside_of
        }
        RETURN 
            p.id AS poi_id,
            b.confidence AS poi_confidence_google,
            pg.placeId AS poi_google_place_id,
            h1.h3Index AS poi_h3_index,
            apoc.text.replace(pg.name, '["\\']', '') AS poi_name_google,
            apoc.text.replace(po.name, '["\\']', '') AS poi_name_osm,
            poi_categories_osm,
            h2.numberOfReviews AS poi_reviews,
            pr.value AS poi_rating,
            ppl.value AS poi_price_level,
            poi_opening_time_total,
            poi_popularity_total,
            poi_popularity_morning_total,
            poi_popularity_noon_total,
            poi_popularity_afternoon_total,
            poi_popularity_evening_total,
            pcl.closed AS poi_closed,
            pcl.permanently AS poi_closed_permanently,
            area_200_population_total,
            area_200_population_men,
            area_200_population_women,
            area_200_population_children_under_five,
            area_200_population_youth_15_24,
            area_200_population_elderly_60_plus,
            area_200_population_women_of_reproductive_age_15_49,
            area_400_population_total,
            area_400_population_men,
            area_400_population_women,
            area_400_population_children_under_five,
            area_400_population_youth_15_24,
            area_400_population_elderly_60_plus,
            area_400_population_women_of_reproductive_age_15_49,
            poi_spending_time,
            poi_waiting_time,
            poi_inside_of
        ORDER BY poi_id
    """

    url = os.getenv('NEO4J_HOST') or 'bolt://localhost:7687'
    df_pois = sp.read.format("org.neo4j.spark.DataSource") \
        .option("url", url) \
        .option("authentication.type", "basic") \
        .option("authentication.basic.username", "neo4j") \
        .option("authentication.basic.password", "password") \
        .option("query", query) \
        .load()
    df_pois = df_pois \
        .withColumn('poi_categories_osm', concat_ws(', ', 'poi_categories_osm')) \
        .withColumn('coordinates', get_coordinates(col('poi_h3_index'))) \
        .withColumn('poi_lat', col('coordinates')[0]) \
        .withColumn('poi_lng', col('coordinates')[1]) \
        .withColumn('poi_popularity_per_opening_hour', col('poi_popularity_total') / col('poi_opening_time_total')) \
        .drop('coordinates')

    # df_pois.filter(col('poi_confidence_google').isNotNull() & col('poi_popularity_total').isNotNull()).show()

    df_pois.coalesce(1).write.mode('overwrite').option('sep', ';').option('header', 'true').csv('results/pois.csv')


def save_popularities(sp):
    query = """
        MATCH (h3:H3Index)<-[:LOCATED_AT]-(p:Poi)<-[b:BELONGS_TO]-(pg:PoiGoogle)-[h:HAS]->(pop:PoiPopularityAverage)
        CALL {
            WITH pg
            MATCH (pg)-[:BELONGS_TO]->(pc:PoiCategory)
            RETURN collect(pc.name) AS poi_categories_google
        }        
        RETURN 
            p.id AS poi_id, 
            b.confidence AS confidence,
            pop.value AS value, 
            h.timestamp AS timestamp, 
            h3.h3Index AS h3_index,
            io.kuwala.h3.h3ToGeo(h3.h3Index) AS centroid,
            poi_categories_google
        ORDER BY poi_id, timestamp
    """

    url = os.getenv('NEO4J_HOST') or 'bolt://localhost:7687'
    df_popularities = sp.read.format("org.neo4j.spark.DataSource") \
        .option("url", url) \
        .option("authentication.type", "basic") \
        .option("authentication.basic.username", "neo4j") \
        .option("authentication.basic.password", "password") \
        .option("query", query) \
        .load()
    df_popularities = df_popularities \
        .withColumn('lat', col('centroid').getItem(1)) \
        .withColumn('lng', col('centroid').getItem(0)) \
        .drop('centroid') \
        .withColumn('poi_categories_google', concat_ws(',', 'poi_categories_google'))

    df_popularities.coalesce(1).write \
        .mode('overwrite') \
        .option('sep', ';') \
        .option('header', 'true') \
        .csv('results/popularity.csv')


def save_opening_hours(sp):
    query = """
        MATCH (p:Poi)<-[b:BELONGS_TO]-(:PoiGoogle)-[h:HAS]->(poh:PoiOpeningHours)
        RETURN p.id AS poi_id, poh.openingTime AS opening_time, poh.closingTime AS closing_time, h.date AS date
        ORDER BY poi_id, date
    """

    url = os.getenv('NEO4J_HOST') or 'bolt://localhost:7687'
    df_pois = sp.read.format("org.neo4j.spark.DataSource") \
        .option("url", url) \
        .option("authentication.type", "basic") \
        .option("authentication.basic.username", "neo4j") \
        .option("authentication.basic.password", "password") \
        .option("query", query) \
        .load()

    df_pois.coalesce(1).write \
        .mode('overwrite') \
        .option('sep', ';') \
        .option('header', 'true') \
        .csv('results/opening_hours.csv')


def save_population_at_resolution(sp, resolution, polygon_coords):
    polygon_cells = None

    if polygon_coords:
        polygon_coords = json.loads(polygon_coords)
        polygon = Polygon(polygon_coords)
        polygon_cells = list(polyfill_polygon(polygon, resolution=resolution))

    query = f"""
        MATCH (h:H3Index)<-[:POPULATION_AT]-(p:Population)
        WITH p, io.kuwala.h3.h3ToParent(h.h3Index, {resolution}) AS h3_index
        {f'WHERE h3_index IN {polygon_cells}' if polygon_cells else ''}
        RETURN 
            h3_index, 
            SUM(p.youth_15_24) AS youth_15_24,
            SUM(p.women_of_reproductive_age_15_49) AS women_of_reproductive_age_15_49,
            SUM(p.total) AS total,
            SUM(p.men) AS men,
            SUM(p.children_under_five) AS children_under_five,
            SUM(p.elderly_60_plus) AS elderly_60_plus,
            SUM(p.women) AS women
        ORDER BY h3_index
    """

    url = os.getenv('NEO4J_HOST') or 'bolt://localhost:7687'
    df_population = sp.read.format("org.neo4j.spark.DataSource") \
        .option("url", url) \
        .option("authentication.type", "basic") \
        .option("authentication.basic.username", "neo4j") \
        .option("authentication.basic.password", "password") \
        .option("query", query) \
        .load()

    df_population.coalesce(1).write \
        .mode('overwrite') \
        .option('sep', ';') \
        .option('header', 'true') \
        .csv('results/population.csv')


def init_save_pois():
    spark = SparkSession \
        .builder \
        .appName('pois') \
        .config('spark.driver.memory', '16g') \
        .config('spark.jars.packages', 'neo4j-contrib:neo4j-connector-apache-spark_2.12:4.0.1_for_spark_3') \
        .getOrCreate()

    save_pois(sp=spark)