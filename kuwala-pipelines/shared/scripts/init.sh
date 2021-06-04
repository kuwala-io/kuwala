#!/bin/bash -e

function remove {
  echo "----------------------------> Removing all dockers started by docker compose <----------------------------"
  docker-compose down
}

trap remove EXIT
docker-compose --profile pipeline_essentials up