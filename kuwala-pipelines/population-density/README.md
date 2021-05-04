# Population Density

Facebook publishes detailed population data with demographic information under its initiative 
[FACEBOOK Data for Good](https://dataforgood.fb.com/tools/population-density-maps/).
It is one of the most granular data sets about the worldwide population using official census and Facebook data combined 
with image recognition.

![Population Density Overview](../../docs/images/population_density_overview.png)

The raw data is aggregated in 1-arcsecond blocks (approx. 30x30 m) squares which we transform to H3 bins at 
resolution 11.<br/>
For each bin there is the statistical population value for:
- Total
- Female
- Male
- Children under 5
- Youth 15 - 24
- Elderly 60 plus
- Women of reproductive age 15 - 49

For more general information check out our 
[Medium article](https://medium.com/kuwala-io/querying-the-most-granular-demographics-dataset-62da16b441a8). 

---

## Prerequisites

Installed version of *node*, *npm*, *Docker* and *docker-compose*

An easy way to run docker on your machine is using [*Docker Desktop*](https://docs.docker.com/desktop/) with a GUI to 
manage your containers.

#### Hints for macOS

Installation of *node + npm* and *docker-compose* via *Homebrew*:

```zsh
brew install node, docker-compose
```

---

## Setup

Install node modules

```zsh
npm ci
```

Make sure Docker is running on your machine.

Start mongo with *docker-compose*

```zsh
docker-compose up -d
```

Load population data into database

```zsh
npm run start-processing:local
```

Follow the prompts to download, process and write data [1]

```console
[1] Data - Process population data
[2] Map - Generate file for Kepler
[0] CANCEL

What do you want to do? [1, 2, 0]: 
```

---

## Usage

Run the app locally.

(Data can only be returned for regions that have previously been downloaded and processed.)

```zsh
npm run start-api:local
```

### API Calls

#### Get Population in a Cell
Request Method: <span style="color:green">**GET**</span><br/>
URL: `/cell`<br/>
Query Params (**required**): `h3_index` ***OR*** `lat, lng`

*Example*: `localhost:3002/cell?h3_index=8b3f304f16c9fff`

#### Get Population within Radius
Request Method: <span style="color:green">**GET**</span><br/>
URL: `/radius/:radius`<br/>
Query Params (**required**): `h3_index` ***OR*** `lat, lng`

*Example*: `localhost:3002/radius/100?h3_index=8b3f304f16c9fff`

#### Get Population within Polygon
Request Method: <span style="color:green">**GET**</span><br/>
URL: `/geojson`<br/>
Request Body (**required**): `GeoJSON` format <br/>

*Example*: `localhost:3002/geojson`<br>
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
### License

We are neither providing nor are we responsible for the population data. This repository is purely a tool for working 
with that data. You are responsible for complying with Facebook's licences when using the data.

Facebook publishes the data under the 
[Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) license.

They recommend the following citation:
> Facebook Connectivity Lab and Center for International Earth Science Information Network - CIESIN - Columbia 
> University. 2016. High Resolution Settlement Layer (HRSL). Source imagery for HRSL © 2016 
> [DigitalGlobe](http://explore.digitalglobe.com/Basemap-Vivid.html). Accessed DAY MONTH YEAR.