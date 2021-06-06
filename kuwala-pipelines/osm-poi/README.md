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

## Prerequisites

Installed version of *node*, *npm*, *Docker* and *docker-compose*.

This project has dependency on [*h3-node*](https://www.npmjs.com/package/h3-node/). This module requires you to have the
following libraries installed on your machine: *git, gyp, make, cmake, and a C compiler (gcc or clang)*.

An easy way to run docker on your machine is using [*Docker Desktop*](https://docs.docker.com/desktop/) with a GUI to 
manage your containers.

#### Hints for macOS

Installation of *node + npm* and *docker-compose* via *Homebrew*:

```zsh
brew install node, docker-compose
```

---

## Run

Proceed only if you followed the initial steps to initialize the main components mentioned here:
[`Initialize Main Components`](https://github.com/kuwala-io/kuwala/tree/master/kuwala-pipelines/)

```zsh
docker-compose run  --service-ports osm-poi start-processing:local
```

Follow the prompts to download, process and write data for a continent, country or region [2]

***Alternative***: You can also download .osm.pbf files directly from [Geofabrik](http://download.geofabrik.de)
and place them in an arbitrary folder under `./tmp/kuwala/osmFiles` and follow [1] instead.

```console
[1] Existing download
[2] New download
[0] Cancel

Do you want to make a new download? [1, 2, 0]: 2

[1] africa
[2] antarctica
[3] asia
[4] australia-oceania
[5] central-america
[6] europe
[7] north-america
[8] south-america
[0] Cancel

Which continent are you interested in? [1...8 / 0]: 

```

---

## Usage

Run the app locally.

(Data can only be returned for regions that have previously been downloaded and processed.)

```zsh
docker-compose run  --service-ports osm-poi start-api:local
```

### API Calls

#### Get POIs within Radius
Request Method: <span style="color:green">**GET**</span><br/>
URL: `/radius/:radius`<br/>
Query Params (**required**): `h3_index` ***OR*** `lat, lng`

*Example*: `localhost:3001/radius/50?lat=52.5291472&lng=13.4015439`

#### Get POIs within Polygon
Request Method: <span style="color:green">**GET**</span><br/>
URL: `/geojson`<br/>
Request Body (**required**): `GeoJSON` format <br/>

*Example*: `localhost:3001/geojson`<br>
Request Body:

```json 
    {
        "geometry": {
            "type": "Polygon",
            "coordinates": […]
        }
    }
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