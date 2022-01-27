# Initialize Main Components

## Prerequisites

Installed version of *Docker* and *docker-compose v2*
([*Go here for instructions*](https://docs.docker.com/compose/install/))

---

### Pipelines

If you want to build all containers for all pipelines, change your working directory to `./kuwala/scripts/shell` and run:


```zsh
sh initialize_all_components.sh
```


You can also build the containers individually for single pipelines. All services are listed in the 
[`./docker-compose.yml`](https://github.com/kuwala-io/kuwala/tree/master/kuwala/docker-compose.yml). Please refer to 
each pipeline's `README.md` on how to run them. You can find the pipeline directories under 
[`./pipelines`](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines).

It would be safer to always run the build commands after pulling new code changes so that your local images 
have the latest code. 

Docker images will only be built once when you run the `initialize_all_components.sh` script, so new changes in the code 
will not reflect on your local unless you explicitly run the build commands.

Please note that the Docker runs will create data folders under `./kuwala/tmp/kuwala` that will be used for db, file 
downloads, and processing results. You can always find the downloaded files over there.

Now you can proceed to any of the pipelines' `README.md` and follow the steps to run them individually.

### Core

To initialize the CLI and Jupyter notebook run within the `./kuwala/scripts/shell` directory:

```zsh
sh initialize_core_components.sh
```

To launch the CLI run:

```zsh
sh run_cli.sh
```

If you only want to start the Jupyter environment run:

```zsh
sh run_jupyter_notebook.sh
```
Or if you are a Windows user having issues to run a `shell` script, you can run a `python` script as an alternative. For example you can run `initialize_core_components.py` under `kuwala/scripts/python`.\
\
*All `shell` scripts are also available in  `python` script using the same file naming, inside the `kuwala/scripts/python` directory*