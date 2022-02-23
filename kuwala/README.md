# Initialize Main Components

## Prerequisites

Installed version of *Docker* and *docker-compose v2*
([*Go here for instructions*](https://docs.docker.com/compose/install/))

---

### Pipelines

Please refer to each pipeline's `README.md` on how to run them. You can find the pipeline directories under 
[`./pipelines`](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines).

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

To launch the CLI run:

```zsh
docker-compose run cli
```

#### Jupyter

If you only want to start the Jupyter environment run:

```zsh
docker-compose run --service-ports jupyter
```