import json
import os
from geojson import Polygon
from kuwala.modules.common import polyfill_polygon


def get_pois_by_category_in_h3(sp, category, resolution, polygon_coords):
    polygon_cells = None

    if polygon_coords:
        polygon_coords = json.loads(polygon_coords)
        polygon = Polygon(polygon_coords)
        polygon_cells = list(polyfill_polygon(polygon, resolution=resolution))

    # noinspection SqlNoDataSourceInspection
    query = '''
        CALL {
            MATCH (pc:PoiCategory)<-[:BELONGS_TO]-(po:PoiOSM)-[:BELONGS_TO]->(p:Poi)-[:LOCATED_AT]->(h:H3Index)
        ''' + f'''WHERE {f'h.h3_index IN {polygon_cells} AND' if polygon_cells else ''} pc.name = '{category}'
            RETURN p
            UNION
            MATCH (pc:PoiCategory)<-[:BELONGS_TO]-(pg:PoiGoogle)-[b:BELONGS_TO]->(p:Poi)-[:LOCATED_AT]->(h:H3Index)
            WHERE 
                {f'h.h3_index IN {polygon_cells} AND' if polygon_cells else ''} 
                b.confidence >= 0.8 AND 
                pc.name = '{category}'
            RETURN p
        ''' + '''}
        WITH p
        MATCH (p)-[:LOCATED_AT]->(h:H3Index)
        ''' + f'''WITH p, io.kuwala.h3.h3ToParent(h.h3Index, {resolution}) AS h3_index
        RETURN h3_index, COUNT(p) AS number_of_{category}
    '''

    url = os.getenv('NEO4J_HOST') or 'bolt://localhost:7687'

    return sp.read.format("org.neo4j.spark.DataSource") \
        .option("url", url) \
        .option("authentication.type", "basic") \
        .option("authentication.basic.username", "neo4j") \
        .option("authentication.basic.password", "password") \
        .option("query", query) \
        .load()
