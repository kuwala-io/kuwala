# Initialize Main Components

## Prerequisites

Installed version of *Docker* and *docker-compose* 
([*Go here for instructions*](https://docs.docker.com/compose/install/))

---

### Pipelines

If you want to build all containers for all pipelines, change your working directory to `./kuwala/scripts` and run:

```zsh
python3 initialize_all_components.py
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

To initialize the CLI and Jupyter notebook run within the `./kuwala/scripts` directory:

```zsh
python3 initialize_core_components.py
```

To launch the CLI run:

```zsh
python3 run_cli.py
```

If you only want to start the Jupyter environment run:

```zsh
python3 run_jupyter_notebook.py
```