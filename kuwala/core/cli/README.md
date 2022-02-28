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

### Prerequisites

1. Installed version of `Docker` and `docker-compose v2`.
   - We recommend using the latest version of [`Docker Desktop`](https://www.docker.com/products/docker-desktop).
2. Installed version of `Python3`.
   - We recommend using version `3.9.5` or higher.
   - To check your current version run `python3 --version`.
3. Installed version of `libpq`.
   - For Mac, you can use brew: `brew install libpq`

### Setup

1. Change your directory to `kuwala/core/cli`.
2. Create a virtual environment.
   - For instructions on how to set up a `venv` on different system see [here](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/).
3. Install dependencies by running `pip3 install --no-cache-dir -r requirements.txt`

### Run

To start the CLI, run the following command from inside the `kuwala/core/cli/src` directory and follow the instructions:

```zsh
python3 main.py
```