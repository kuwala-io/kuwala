from src.neo4j.Neo4jImporter import import_data_from_mongo

if __name__ == '__main__':
    import_data_from_mongo('osm-poi', 'pois')
