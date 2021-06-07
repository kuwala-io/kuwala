# Initialize Main Components
---

## Prerequisites

Installed version of *Docker* and *docker-compose* 
([*Go here for instructions*](https://docs.docker.com/compose/install/))

---

## Setup

First you always need to change your working directory to `./kuwala-pipelines`

Next, it would be safer to always run the below build command after pulling new code changes so that your local images 
have the latest code. 

Docker images will only be built once when you run the `init.sh` script, so new changes in the code will not reflect on 
your local unless you explicitly run the build command below.

```zsh
docker-compose build osm-poi population-density google-poi
```

Now simply run the below init script to spawn the essential docker components our pipelines rely on. Please note that 
this is a blocking script and has to run in a separate terminal. When you exit ( `ctrl + c` the script automatically 
cleans up all docker runs related to this project). 

Please note that the init script will create data folders under ./tmp/kuwala that will be used for db, osm & google file 
downloads/operations. You can always find the downloaded files over there.

```zsh
# Run chmod only the first time you setup the project
chmod +x ./shared/scripts/init.sh
# end of first time

# Run init.sh in it's own separate terminal session
# make sure you run the script while having `./kuwala-pipelines` as a working directory.
./shared/scripts/init.sh 
```

Now you can proceed to any of the pipelines' Readme and follow the steps to run them.