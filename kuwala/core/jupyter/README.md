# Jupyter Notebooks

We have two example Jupyter notebooks working with data from different pipelines. Within the example notebooks, we 
included [pandas-profiling](https://github.com/pandas-profiling/pandas-profiling) for having a data quality overview, and 
we use the [Unfolded Map SDK](https://docs.unfolded.ai/map-sdk/python-map-sdk) to visualize the results.

---

## Example Notebooks

The example notebooks can be found under `kuwala/core/jupyter/notebooks`.

- **Popularity Correlation**: With this notebook you can correlate any value associated with a geo-reference with the 
Google popularity score.
- **POI Category by Population**: With this example, you can simply select a POI category and get a score weighted by 
the population indicating how high the density of the POI category is in a specific region relative to its population.

---

## Usage

First you need to start the Postgres instance by running:

```zsh
docker-compose --profile database up
```

To start the Jupyter environment, run:

```zsh
docker-compose run --service-ports jupyter
```

### Convenience Methods

Under `modules` you can find convenience methods to import into your notebooks (e.g., `get_population_in_polygon`).