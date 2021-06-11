# Initialize Main Components
---

## Prerequisites

Installed version of *Docker* and *docker-compose* ([*Go here for instructions*](https://docs.docker.com/compose/install/))

---

## Setup

First you always need to change your working directory to `./kuwala`

Next, it would be safer to always run the below build command after pulling new code changes so that your local images have the latest code. 

Docker images will only be built once when you run the `init.sh` script, so new changes in the code will not reflect on your local unless you explicitly run the build command below.

```zsh
docker-compose build osm-poi population-density google-poi
```

Now simply run the below init script to spawn the essential docker components our pipelines rely on. Please note that this is a blocking script and has to run in a separate terminal. When you exit ( `ctrl + c` the script automatically clean up all docker runs related to this project). 

Please note that the init script will create data folders under ./tmp/kuwala that will be used for db, osm & google file downlaods/operations. You can always find the downloaded files overthere.

```zsh
# Run chmod only the first time you setup the project
chmod +x ./common/scripts/init.sh
# end of first time

# Run init.sh in it's own separate terminal session
# make sure you run the script while having `./kuwala` as a working directory.
./pipelines/common/scripts/init.sh 
```

Now you can proceed to any of the pipleines Readme and follow the steps to run them

---

### License

We are neither providing nor are we responsible for the population data. This repository is purely a tool for working 
with that data. You are responsible for complying with Facebook's licences when using the data.

Facebook publishes the data under the 
[Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) license.

They recommend the following citation:
> Facebook Connectivity Lab and Center for International Earth Science Information Network - CIESIN - Columbia 
> University. 2016. High Resolution Settlement Layer (HRSL). Source imagery for HRSL © 2016 
> [DigitalGlobe](http://explore.digitalglobe.com/Basemap-Vivid.html). Accessed DAY MONTH YEAR.