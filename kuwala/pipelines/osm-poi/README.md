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
docker-compose run osm-parquetizer java -jar --continent=<continent> --country=<country> --country_region=<country_region>
```

The country and continent have to be passed as ISO-3 country codes. The country_region is based on Geofabrik's naming. 

For example:

```zsh
docker-compose run --rm osm-parquetizer java -jar target/osm-parquetizer-1.0.1-SNAPSHOT.jar --continent=eu --country=mlt
```

### Process Parquet files

We need to fetch some GeoJSON over the Nominatim API. In order to not run into rate limits make sure to have a proxy
running. You can set the proxy address over the environment variable `PROXY_ADDRESS`.

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