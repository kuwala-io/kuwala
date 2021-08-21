# OpenStreetMap POIs

[OpenStreetMap](https://www.openstreetmap.org) (OSM) is maybe the most extensive open data project for geo-data. It has 
rich information on points of interest (POIs), such as apartments, shops, or offices, globally.

Based on the original `.osm` files, which [Geofabrik](http://download.geofabrik.de) provides as a daily update, we parse 
the OSM tags and create consolidated objects.

We aggregate tags that are useful for categorization into 24 high-level categories:

`administration, airport, apartment, art_culture, automobile, beauty, cafe, drinks, education, entertainment, food, 
groceries, medical, misc, office, public_service, public_transportation, recreation, religious_building, service, 
shopping, social_service, sport, tourism, wholesaler`

For ways and relations, we transform the building footprint into the `GeoJSON` format. For address and contact details, 
we also consolidate the OSM tags into separate objects.

---

## Run

### Download PBF files

```zsh
docker-compose run osm-poi
Creating network "kuwala_default" with the default driver
Creating kuwala_osm-poi_run ... done
? What do you want to do? Download
? Which continent are you interested in? europe
? Which region are you interested in? malta
```

### Parse PBF files to Parquet

```zsh
docker-compose run osm-parquetizer java -jar target/osm-parquetizer-1.0.1-SNAPSHOT.jar <pbf-path> <parquet-path>
```

The `pbf-path` starts with `tmp/osmFiles/pbf` and is followed by the path for the region to the `.osm.pbf` file.

The `parquet-path` starts with `tmp/osmFiles/parquet`, is followed by the path for the region without the `.osm.pbf`
extension and ends with `/osm-parquetizer`.

For example:

```zsh
docker-compose run osm-parquetizer java -jar target/osm-parquetizer-1.0.1-SNAPSHOT.jar tmp/osmFiles/pbf/europe/malta-latest.osm.pbf tmp/osmFiles/parquet/europe/malta-latest/osm-parquetizer
```

### Process Parquet files

```zsh
docker-compose run osm-poi
Creating kuwala_osm-poi_run ... done
? What do you want to do? Process
? Which continent are you interested in? europe
? Which country are you interested in? malta-latest
```

---
#### Categories

Relevant yet unmatched OSM tags are automatically added to the category `misc` and then can be added to more appropriate high-level
categories. When committing, also include the new tags under `misc` for later categorization. 

---
### License

We are neither providing nor are we responsible for the OSM data. This repository is purely a tool for working
with that data. You are responsible for complying with OSM's and [Geofabrik](http://www.geofabrik.de)'s licences when using the data.

OSM is published under the [Open Data Commons Open Database License](https://www.openstreetmap.org/copyright).