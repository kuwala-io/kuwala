import json
import logging
import questionary
import sys

sys.path.insert(0, '../../../pipelines/common/')
sys.path.insert(0, '../')

import python_utils.src.FileSelector as FileSelector
from hdx.data.dataset import Dataset


def load_pipelines():
    with open(f'../resources/pipelines.json') as f:
        pipelines = json.load(f)

        f.close()

        return pipelines


def select_pipelines() -> [str]:
    pipelines = load_pipelines()
    pipelines_selected = False
    selected_pipelines = None

    while not pipelines_selected:
        selected_pipelines = questionary.checkbox('Which pipelines do you want to include?', pipelines).ask()

        if selected_pipelines:
            pipelines_selected = True
        else:
            logging.error('No pipelines selected. Please pick at least one!')

    return selected_pipelines


def select_region(pipelines: [str]) -> [str, str]:
    continent = None
    country = None
    country_region = None
    population_density_id = None

    if 'osm-poi' in pipelines or 'google-poi' in pipelines:
        file = FileSelector.select_osm_file()
        continent = file['continent']
        country = file['country']
        country_region = file['country_region']
    elif 'population-density' in pipelines:
        file = FileSelector.select_population_file()
        continent = file['continent']
        country = file['country']
        population_density_id = file['id']

    # TODO if both osm-poi and population density are selected, check if population data is available for the selected
    #   country

    return continent, country, country_region, population_density_id


def select_demographic_groups(d):
    d = Dataset.read_from_hdx(d)
    selected = FileSelector.select_demographic_groups(d)

    # Apply json.dumps() twice to escape double quotes
    return json.dumps(json.dumps(selected))
