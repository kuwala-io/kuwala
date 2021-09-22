# Initialize Main Components
---

## Prerequisites

Installed version of *Docker* and *docker-compose* 
([*Go here for instructions*](https://docs.docker.com/compose/install/))

---

## Setup

First you always need to change your working directory to `./kuwala/scripts`

Next, it would be safer to always run the below build command after pulling new code changes so that your local images 
have the latest code. 

Docker images will only be built once when you run the `initialize_components.sh` script, so new changes in the code 
will not reflect on your local unless you explicitly run the build command below.

```zsh
sh build_all_containers.sh
```

Please note that the docker runs will create data folders under `./kuwala/tmp/kuwala` that will be used for db, file 
downloads, and processing results. You can always find the downloaded files over there.

Now you can proceed to any of the pipelines' Readme and follow the steps to run them individually.