# Database Transformer

We are using [dbt](https://github.com/dbt-labs/dbt-core) for doing transformations on the data loaded into the data 
warehouse. When using dbt, you write "models" which can be seen as components for complex transformations.

## Usage

To make sure you are running the latest version of the transformer, build the Docker image from inside the `kuwala` 
directory by running:

```zsh
docker-compose build database-transformer
```

The dbt models are stored under `kuwala/core/database/transformer/dbt/models`. To run all the models, execute the
database-transformer by running:

```zsh
docker-compose run database-transformer
```

## Kuwala dbt Controller

Since dbt itself is running on the data warehouse and executing the compiled SQL queries there, it is not usable like
any other pip package (see their [docs](https://docs.getdbt.com/docs/running-a-dbt-project/dbt-api)). However, since we
want to also execute dbt macros, which can be written as functions, in the Jupyter notebook environment and work with 
data frames there, we have decided to write a controller that executes dbt macros with a simple Python method.

The existing macros are categorized and can be found under `kuwala/core/database/transformer/dbt/models`.

Some macro results are saved as CSV files and can be returned as a Pandas data frame (e.g., 
`get_population_in_polygon`) 