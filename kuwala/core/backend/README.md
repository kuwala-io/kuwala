# Backend [EXPERIMENTAL]

## Launching the API

To launch the API, simply run the following command from inside the `root` directory of the repository.

```zsh
docker-compose --profile backend up
```

<details>
    <summary>Development mode</summary>

#### Installation

First, install the dependencies in a new virtual environment by running the following command from inside the 
`kuwala/core/backend` directory:

```zsh
pip install --no-cache-dir -r requirements.txt
```

To set up a new virtual environment, you can follow the steps outlined 
[here](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/).

#### Launching

First, start the backend database by running the following command from inside the `root` directory of the repository:

```zsh
docker-compose --profile backend_database up
```

After you installed all requirements, you can launch the API by running the following command from inside the 
`kuwala/core/backend` directory:

```zsh
python3 app/main.py
```

To force the API server to reload everytime when code changes have been detected, simply pass `--dev=True` as a 
parameter when launching the API.

```zsh
python3 app/main.py --dev=True
```

**Important:** You need to set the following environment variables:

```dotenv
DATABASE_USER=kuwala
DATABASE_PASSWORD=password
DATABASE_NAME=kuwala
DATABASE_HOST=localhost
```
</details>

## API Routes

To see a complete documentation of all available API routes, launch the API and open `http://0.0.0.0:8000/docs` in your 
browser.


## Data Sources

We are using dbt for doing transformations on top of data warehouses, so we are providing the following connectors:

<details>
    <summary>Postgres</summary>

#### Connection parameters

- host
- port
- user
- password
- database

#### Table parameters

- data_source_id
- schema_name
- table_name

</details>

<details>
    <summary>BigQuery</summary>

#### Connection parameters

- credentials_json
  - type
  - project_id
  - private_key_id
  - private_key
  - client_email
  - client_id
  - auth_uri
  - token_uri
  - auth_provider_x509_cert_url
  - client_x509_cert_url

#### Table parameters

- data_source_id
- project_name
- dataset_name
- table_name

</details>
