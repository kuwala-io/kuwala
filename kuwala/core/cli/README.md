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

To make sure you are running the latest version of all pipelines, run from inside the root directory:


```zsh
cd kuwala/scripts/shell && sh initialize_all_components.sh
```

Or if you are a Windows User having issue to run a `shell` script, you can run a `python` script as an alternative:

```zsh
cd kuwala/scripts/python && python3 initialize_all_components.py
```

*All `shell` scripts are also available in  `python` script using the same file naming, inside the `/python` directory*


To start the CLI, run the following script from inside the `kuwala/scripts/shell` directory and follow the instructions:

```zsh
sh run_cli.sh
```
or `python3 run_cli.py` from inside the `kuwala/scripts/python` directory