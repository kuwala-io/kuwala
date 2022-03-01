import logging
import os
import sys

import psycopg2
import requests

sys.path.insert(0, "../../../common/")

from time import sleep

from InputController import (
    select_demo,
    select_demographic_groups,
    select_pipelines,
    select_region,
)
from PipelineOrchestrator import download_demo, run_pipelines
from python_on_whales import DockerClient


def keep_script_running():
    print(
        "\nTo stop the CLI along with the Jupyter environment and the database press 'control + c'"
    )

    try:
        while True:
            sleep(5)
    except KeyboardInterrupt:
        logging.info("Stopping all Docker services…")

        docker = DockerClient(compose_project_name="kuwala")

        docker.compose.down(remove_orphans=True)

        sys.exit(0)


def launch_jupyter_notebook():
    logging.info("Starting database and Jupyter…")

    database_profile = DockerClient(
        compose_profiles=["database"], compose_project_name="kuwala"
    )
    jupyter_profile = DockerClient(
        compose_profiles=["jupyter"], compose_project_name="kuwala"
    )

    database_profile.compose.up(detach=True)
    jupyter_profile.compose.up(detach=True)

    launched_jupyter = False
    connected_to_db = False
    max_retries = 120
    sleep_time = 5
    current_attempt = 1
    database_host = os.getenv("DATABASE_HOST") or "localhost"
    jupyter_host = os.getenv("JUPYTER_HOST") or "localhost"

    while (
        not launched_jupyter or not connected_to_db
    ) and current_attempt <= max_retries:
        # noinspection PyBroadException
        try:
            if not connected_to_db:
                db = psycopg2.connect(
                    host=database_host,
                    port=5432,
                    database="kuwala",
                    user="kuwala",
                    password="password",
                )

                connected_to_db = True

                db.close()

            if not launched_jupyter:
                test_request = requests.get(
                    f"http://{jupyter_host}:8888/lab/tree/kuwala"
                )

                launched_jupyter = test_request.ok
        except Exception:
            current_attempt += 1
            sleep(sleep_time)

    if launched_jupyter and connected_to_db:
        logging.info("Successfully launched database and Jupyter!")
    else:
        if not connected_to_db:
            logging.error("Couldn't connect to database.")
        if not launched_jupyter:
            logging.error("Couldn't launch Jupyter.")

    print(
        "\n############################################################################"
    )
    print("\nOPEN THIS IN YOUR BROWSER TO SEE THE JUPYTER NOTEBOOK")
    print(
        "\nhttp://localhost:8888/lab/tree/kuwala/notebooks/popularity_correlation.ipynb\n"
    )
    print(
        "############################################################################"
    )


if __name__ == "__main__":
    logging.basicConfig(
        format="%(levelname)s %(asctime)s: %(message)s",
        level=logging.INFO,
        datefmt="%m/%d/%Y %I:%M:%S %p",
    )
    logging.info("Kuwala CLI is ready to rumble")

    demo = select_demo()

    if demo:
        download_demo()
    else:
        pipelines = select_pipelines()
        selected_region = select_region(pipelines)
        selected_region["demographic_groups"] = select_demographic_groups(
            pipelines, selected_region
        )

        logging.info(
            "You can lean back now and wait for the pipelines to do their magic."
        )
        logging.info(
            f'Starting {str(", ").join(pipelines)} {"pipelines" if len(pipelines) > 1 else "pipeline"}'
        )

        run_pipelines(pipelines, selected_region)

    launch_jupyter_notebook()
    keep_script_running()
