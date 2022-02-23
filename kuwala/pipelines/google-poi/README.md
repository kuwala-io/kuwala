# Google POIs

Nearly every customer facing business and POI is represented on Google. Apart from data on reviews and categorization 
there is also aggregated and anonymized movement data available represented as a popularity index for a location.

The popularity is a relative score per location between 0 and 100. A score of 100 for a given hour represents the time 
of the respective place with its highest number of visitors during the week. Each value is marked with a timestamp which
makes it suitable for time series analysis.

For places with a very high number of average visitors there is also the live popularity for the current hour available.
This score can also be over 100 if the number of visitors is extraordinarily high.

![Popularity Graph](../../../docs/images/google_poi_popularity_graph.png)

### Features

- Name
- PlaceID (from Google)
- Location (latitude and longitude)
- H3 index
- Address
- Timezone
- Categories
- Temporarily closed tag
- Permanently closed tag
- Inside of tag (e.g., inside an airport or shopping mall)
- Contact (phone and website)
- Opening hours (also considers public holidays)
- Rating (stars and number of reviews)
- Price level
- Popularity
- Waiting time
- Spending time

---

## Usage

### Start the scraping api

```zsh
docker-compose --profile google-poi-scraper up
```

### Getting Google POI data based on OSM queries

Those are the command line parameters for setting the geographic scope:

- `--continent`
- `--country`
- `--country_region` (optional)
- `--polygon_coords` (optional)
- `--polygon_resolution` (optional, default: 9)

To scrape the Google data for all OSM POIs that are in the database after running the 
[OSM pipeline](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/osm-poi) execute in a new terminal 
window:

```zsh
docker-compose run google-poi-pipeline --continent=<> --country=<> --country_region=<>
```

To run the scraper just for a subregion of the processed OSM data, you can provide the optional parameter 
`polygon_coords`, which passes the coordinates according to the GeoJSON format for polygons. Additionally, the H3
resolution for the polyfill can be provided through the `polygon_resolution` parameter (default: 9).

```zsh
docker-compose run google-poi-pipeline --continent=<> --country=<> --country_region=<> --polygon_coords="[[[14.490726008861989,35.88842705928255],[14.490726008861989,35.90641346655704],[14.51292661409779,35.90641346655704],[14.51292661409779,35.88842705928255],[14.490726008861989,35.88842705928255]]]"
```

### Getting Google POI data for a list of search strings

Instead of generating search strings based on OSM data, you can also provide a list of custom search strings and scrape
the Google data based on that. You still need to provide `--continent` and `--country` to give the results geographical 
context. The search strings have to be in a CSV file with the columns `id` and `query`. The CSV has to be placed under
`kuwala/tmp/kuwala/google_files/<continent>/<country>/search_strings/custom_search_strings.csv`

### API Calls

For performance reasons the amount of queries or ids that can be sent with one query is limited to 100.

#### Get encoded placeID and location for search string

Request Method: <span style="color:green">**GET**</span><br/>
URL: `/search`<br/>
Request Body (**required**): Array of search strings<br/>

*Example*: `localhost:3003/search`</br>
Request Body (sent in JSON format):

```json 
[
    "Eiffel Tower, Avenue Anatole France 5,  75007 Paris",
    "Piccadilly Circus station, London",
    "Starbucks, Grunerstraße 20, 10179 Berlin"
]
```

#### Get POI information based on encoded placeID

The encoded placeIDs must be retrieved over the `/search` call.

Request Method: <span style="color:green">**GET**</span><br/>
URL: `/poi-information`<br/>
Request Body (**required**): Array of encoded placeIDs<br/>

*Example*: `localhost:3003/poi-information`<br>
Request Body (sent in JSON format):

```json 
[
    "0x47e66e2964e34e2d:0x8ddca9ee380ef7e0",
    "0x487604d3e05e54bd:0xa3f4c9ef40a075c3",
    "0x47a84e22134bcf99:0x5541176eb2ed92f7"
]
```

#### Get current popularity based on encoded placeID

The encoded placeID must be retrieved over the `/search` call.

Request Method: <span style="color:green">**GET**</span><br/>
URL: `/popularity`<br/>
Request Body (**required**): Array of encoded placeIDs<br/>

*Example*: `localhost:3003/popularity`<br>
Request Body (sent in JSON format):

```json 
[
    "0x47e66e2964e34e2d:0x8ddca9ee380ef7e0",
    "0x487604d3e05e54bd:0xa3f4c9ef40a075c3",
    "0x47a84e22134bcf99:0x5541176eb2ed92f7"
]
```

---
### License

We are not responsible for nor do we take any responsibility for legal claims that might arise. Use at your own risk. 