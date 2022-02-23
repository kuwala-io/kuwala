# Database Transformer

We are using [dbt](https://github.com/dbt-labs/dbt-core) for doing transformations on the data loaded into the data 
warehouse. When using dbt, you write "models" which can be seen as components for complex transformations.

## Usage

First you need to start the Postgres instance by running:

```zsh
docker-compose --profile database up
```

The dbt models are stored under `kuwala/core/database/transformer/dbt/models`. To run all the models, execute the
database-transformer by running:

```zsh
docker-compose run database-transformer
```

### Overview of All Existing Models

To see the dependency graph and documentation of all existing dbt models, run the following command from inside the 
`kuwala/core/database/transformer/dbt` directory:

```zsh
dbt docs generate --profiles-dir .
```

Then run:

```zsh
dbt docs serve --profiles-dir .
```

#### Model Configuration Variables

We currently built dbt models to get aggregated POI and population data in an H3 grid (visualized in the model 
dependency graph described in the section above). The required variables are set in the 
`kuwala/core/database/transformer/dbt/dbt_project.yml`. 

<details>
    <summary>List of the current variables:</summary><br/>

- focus_brand
  - Type: string
  - Description: The Google POI scraper may take a custom list of queries for POIs. This is especially useful when you have a complete list of POIs of different brands beyond OSM. You can count and benchmark a focus brand by providing the ID prefix of the focus brand.
- grid_resolution
  - Type: integer
  - Description: H3 resolution for POI and population aggregation grids.
- start_date
  - Type: date
  - Description: Starting date from which to consider time series data such as popularity scores.
- end_date
  - Type: date
  - Description: End date until which to consider time series data such as popularity scores.
- first_morning_hour
  - Type: integer
  - Description: First hour of the day that is considered to be in the morning.
- last_morning_hour
  - Type: integer
  - Description: Last hour of the day that is considered to be in the morning.
- last_noon_hour
  - Type: integer
  - Description: Last hour of the day that is considered to be noon.
- last_afternoon_hour
  - Type: integer
  - Description: Last hour of the day that is considered to be in the afternoon. Everything beyond that up until the first morning hour is considered to be evening.
</details>

## Kuwala dbt Controller

Since dbt itself is running on the data warehouse and executing the compiled SQL queries there, it is not usable like
any other pip package (see their [docs](https://docs.getdbt.com/docs/running-a-dbt-project/dbt-api)). However, since we
want to also execute dbt macros, which can be written as functions, in the Jupyter notebook environment and work with 
data frames there, we have decided to write a controller that executes dbt macros with a simple Python method.

The existing macros are categorized and can be found under `kuwala/core/database/transformer/dbt/models`.

Some macro results are saved as CSV files and can be returned as a Pandas data frame (e.g., 
`get_population_in_polygon`)
