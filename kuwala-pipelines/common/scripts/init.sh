#!/bin/bash -e

function remove {
  echo "----------------------------> Removing all dockers started by docker compose <----------------------------"
  docker-compose down
}
mkdir -p ./tmp/kuwala/db
mkdir -p ./tmp/kuwala/countries
mkdir -p ./tmp/kuwala/osmFiles

trap remove EXIT
docker-compose --profile pipeline_essentials up