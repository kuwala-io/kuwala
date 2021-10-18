reset
docker stop $(docker ps -a -q)
docker-compose down
docker-compose rm -f