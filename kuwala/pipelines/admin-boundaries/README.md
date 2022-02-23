# Admin Boundaries

### EXPERIMENTAL: Pipeline is WIP and not integrated into the CLI

Having a source for worldwide admin boundaries is a common base functionality for different use cases. An admin
boundary can be as big as a continent or country or as small as a city or district. There exist different datasets of
different quality for specific regions in the world. We identified OpenStreetMap (OSM) to be the best starting point
thanks to its large coverage and good quality. There are specific datasets with better coverage and accuracy than OSM
and the goal would be to include them as well in the future.

---

## Usage

We are building the admin boundaries based on the pre-processed OSM files. So first, you need to run the 
[OSM-pipeline](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/osm-poi) for the country you are 
interested in. With this pipeline, we retrieve the admin boundaries and build a harmonized hierarchy.

Those are the command line parameters for setting the geographic scope:

- `--continent`
- `--country`
- `--country_region` (optional)

So for starting the pipeline, run the following command:

```shell
docker-compose run admin-boundaries --continent=<> --country=<> --country_region=<>
```

---
### License

We are neither providing nor are we responsible for the OSM data. This repository is purely a tool for working with 
that data. You are responsible for complying with OSM's and [Geofabrik's](http://www.geofabrik.de) licences when using 
the data.

OSM is published under the [Open Data Commons Open Database License](https://www.openstreetmap.org/copyright).