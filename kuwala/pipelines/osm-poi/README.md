### Parse PBF files to Parquet

```zsh
docker-compose run osm-parquetizer java -jar target/osm-parquetizer-1.0.1-SNAPSHOT.jar <pbf-path> <parquet-path>
```

For example:

```zsh
docker-compose run osm-parquetizer java -jar target/osm-parquetizer-1.0.1-SNAPSHOT.jar tmp/osmFiles/pbf/europe/malta-latest.osm.pbf tmp/osmFiles/parquet/europe/malta-latest
```