# Backend

## Installation

First, install the dependencies in a new virtual environment by running the following command from inside the 
`kuwala/core/backend` directory:

```zsh
pip install --no-cache-dir -r requirements.txt
```

To set up a new virtual environment, you can follow the steps outlined 
[here](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/).

## Launching the API

After you installed all requirements, you can launch the API by running the following command from inside the 
`kuwala/core/backend` directory:

```zsh
python3 app/main.py
```

### Development mode

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