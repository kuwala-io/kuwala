# Database Importer

We are using Postgres as the data warehouse. After running the individual data pipelines, we import the results to
Postgres with this importer. The importer currently imports data by geographic region.

The importer loads the data from `kuwala/tmp/kuwala`. Currently, it tries to find data for the following pipelines:

- admin-boundaries
- google-poi
- osm-poi
- population-density

In case no data has been processed for the specified region, the import for the respective pipeline is skipped.

---

## Usage

To make sure you are running the latest version of the importer, build the Docker image from inside the `kuwala` 
directory by running:

```zsh
docker-compose build database-importer
```

Those are the command line parameters for setting the geographic scope:

- `--continent`
- `--country`
- `--country_region` (optional)

For importing the population-density data, you need to pass the `population_density_date` parameter (e.g., 
'2020_03_04'). The date is included in the file name of the result Parquet file.

First you need to start the Postgres instance by running:

```zsh
docker-compose --profile database up
```

To start the importer, run:

```zsh
docker-compose run database-importer --continent=<> --country=<> --country_region=<>
```
