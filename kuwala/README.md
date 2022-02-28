# Initialize Main Components

## Prerequisites

Installed version of *Docker* and *docker-compose v2*
([*Go here for instructions*](https://docs.docker.com/compose/install/))

---

### Pipelines

Please refer to each pipeline's `README.md` on how to run them. You can find the pipeline directories under 
[`./pipelines`](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines).

We currently have five pipelines for different third-party data sources which can easily be imported into a Postgres 
database. The following pipelines are integrated:

 - [Admin Boundaries](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/admin-boundaries/README.md)
 - [Google POIs](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/google-poi/README.md)
 - [Google Trends](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/google-trends/README.md)
 - [OSM POIs](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/osm-poi/README.md)
 - [Population Density](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/population-density/README.md)

Please note that the Docker runs will create data folders under `./kuwala/tmp/kuwala` that will be used for db, file 
downloads, and processing results. You can always find the downloaded files over there.

Now you can proceed to any of the pipelines' `README.md` and follow the steps to run them individually.

### Core

#### Database

To launch the database in the background, run:

```zsh
docker-compose --profile database up
```

#### Database Importer

To import the result of the data pipelines, run the `database-importer`:

```zsh
docker-compose run database-importer --continent=<> --country=<> --country_region=<> [--population_density_date=<>]
```

#### CLI

To launch the CLI, please refer to the instructions in its [README](https://github.com/kuwala-io/kuwala/tree/master/kuwala/core/cli/README.md).

#### Jupyter

If you only want to start the Jupyter environment run:

```zsh
docker-compose run --service-ports jupyter
```