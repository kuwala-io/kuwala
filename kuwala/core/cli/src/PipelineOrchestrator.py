import json
import logging
import os
import shutil
import sys
from time import sleep
import zipfile

import psycopg2
from python_on_whales import DockerClient, docker
from python_utils.src.FileDownloader import download_file
import requests


def download_demo():
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, "../../../tmp/kuwala/db/postgres.zip")

    if os.path.exists(file_path.replace(".zip", "/14")):
        return

    download_file(
        url="https://kuwala-demo.s3.eu-central-1.amazonaws.com/postgres.zip",
        path=file_path,
    )

    logging.info("Preparing demo data…")

    with zipfile.ZipFile(file_path, "r") as zip_ref:
        zip_ref.extractall(file_path.split("/postgres.zip")[0])

    os.remove(file_path)
    shutil.rmtree(file_path.replace("postgres.zip", "__MACOSX"))


def run_osm_poi_pipeline(url, continent, country, country_region):
    print(
        docker.compose.run(
            service="osm-poi",
            remove=True,
            command=[
                "--action",
                "download",
                "--url",
                url,
                "--continent",
                continent,
                "--country",
                country,
                "--country_region",
                country_region,
            ],
        )
    )
    print(
        docker.compose.run(
            service="osm-parquetizer",
            remove=True,
            command=[
                "java",
                "-jar",
                "target/osm-parquetizer-1.0.1-SNAPSHOT.jar",
                "--continent",
                continent,
                "--country",
                country,
                "--country_region",
                country_region,
            ],
        )
    )
    print(
        docker.compose.run(
            service="osm-poi",
            remove=True,
            command=[
                "--action",
                "process",
                "--continent",
                continent,
                "--country",
                country,
                "--country_region",
                country_region,
            ],
        )
    )


def run_google_poi_pipeline(continent, country, country_region):
    google_poi_scraper_profile = DockerClient(compose_profiles=["google-poi-scraper"])

    logging.info("Launching Google scraper…")
    google_poi_scraper_profile.compose.up(detach=True)

    launched_scraper = False
    max_retries = 120
    sleep_time = 5
    current_attempt = 1

    while not launched_scraper and current_attempt <= max_retries:
        # noinspection PyBroadException
        try:
            test_request = requests.get("http://localhost:3003")

            launched_scraper = test_request.status_code
        except Exception:
            current_attempt += 1
            sleep(sleep_time)

    if not launched_scraper:
        logging.error("Couldn't launch Google scraper!")

        return

    print(
        docker.compose.run(
            service="google-poi-pipeline",
            remove=True,
            command=[
                "--continent",
                continent,
                "--country",
                country,
                "--country_region",
                country_region,
            ],
        )
    )
    google_poi_scraper_profile.compose.stop()


def run_population_density_pipeline(continent, country, demographic_groups):
    print(
        docker.compose.run(
            service="population-density",
            remove=True,
            command=[
                "--continent",
                continent,
                "--country",
                country,
                "--demographic_groups",
                json.loads(demographic_groups),
            ],
        )
    )


def run_database_importer(
    continent, country, country_region, population_density_update_date
):
    logging.info("Starting database…")

    database_profile = DockerClient(compose_profiles=["database"])
    connected_to_db = False
    max_retries = 120
    sleep_time = 5
    current_attempt = 1

    database_profile.compose.up(detach=True)

    while not connected_to_db and current_attempt <= max_retries:
        # noinspection PyBroadException
        try:
            db = psycopg2.connect(
                host="localhost",
                port=5432,
                database="kuwala",
                user="kuwala",
                password="password",
            )

            connected_to_db = True

            db.close()
        except Exception:
            current_attempt += 1
            sleep(sleep_time)

    if not connected_to_db:
        logging.error("Couldn't connect to database.")
        sys.exit(1)

    print(
        docker.compose.run(
            service="database-importer",
            remove=True,
            command=[
                "--continent",
                continent,
                "--country",
                country,
                "--country_region",
                country_region,
                "--population_density_date",
                population_density_update_date,
            ],
        )
    )

    return database_profile


def run_database_transformer(database_profile):
    print(docker.compose.run(service="database-transformer", remove=True))

    database_profile.compose.stop()


def run_pipelines(pipelines: [str], selected_region: dict):
    continent = selected_region["continent"]
    country = selected_region["country"]
    country_region = selected_region["country_region"]
    population_density_update_date = selected_region["population_density_update_date"]

    if "google-poi" in pipelines or "osm-poi" in pipelines:
        run_osm_poi_pipeline(
            selected_region["osm_url"], continent, country, country_region
        )

    if "google-poi" in pipelines:
        run_google_poi_pipeline(continent, country, country_region)

    if "population-density" in pipelines:
        run_population_density_pipeline(
            continent, country, selected_region["demographic_groups"]
        )

    database_profile = run_database_importer(
        continent, country, country_region, population_density_update_date
    )

    run_database_transformer(database_profile)
    docker.compose.down(remove_orphans=True)
