# CLI

The CLI is a convenient way to orchestrate the pipeline runs. You can select which pipelines you would like to run and
for which region. If applicable, it will ask you for additional parameters such as the demographic groups you would like
to include for the population density data.

When you made all your inputs, the CLI will trigger the Docker runs and import all the data into the data warehouse.
When the data is imported, a Jupyter notebook with an example for correlating the Google popularity score will open
automatically.

The following pipelines can currently be selected through the CLI:

- google-poi
- osm-poi
- population-density

---

## Usage

To start the CLI, run the following command from inside the root directory and follow the instructions:

```zsh
docker-compose run cli
```