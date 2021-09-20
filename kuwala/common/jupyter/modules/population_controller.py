import json
import os
from geojson import Polygon
from kuwala.modules.common import polyfill_polygon


def get_population_in_h3(sp, resolution, polygon_coords):
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

    return sp.read.format("org.neo4j.spark.DataSource") \
        .option("url", url) \
        .option("authentication.type", "basic") \
        .option("authentication.basic.username", "neo4j") \
        .option("authentication.basic.password", "password") \
        .option("query", query) \
        .load()
