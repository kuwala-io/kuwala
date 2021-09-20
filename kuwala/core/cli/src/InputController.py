import json
import logging
import os
import questionary
import kuwala.common.python_utils.src.FileSelector as FileSelector
from hdx.data.dataset import Dataset


def select_demo():
    choices = ['Run Pipelines myself', 'Use demo data for Portugal']
    choice = questionary.select('Do you want to run and select the pipelines yourself or do you want to use a '
                                'preprocessed demo with data for Portugal?',
                                choices=choices) \
        .ask()

    return choices.index(choice) == 1


def load_pipelines():
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, '../resources/pipelines.json')

    with open(file_path) as f:
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
    osm_url = None

    if 'osm-poi' in pipelines or 'google-poi' in pipelines:
        file = FileSelector.select_osm_file()
        continent = file['continent']
        country = file['country']
        country_region = file['country_region']
        osm_url = file['url']
    elif 'population-density' in pipelines:
        file = FileSelector.select_population_file()
        continent = file['continent']
        country = file['country']
        population_density_id = file['id']

    # TODO if both osm-poi and population density are selected, check if population data is available for the selected
    #   country

    return dict(
        continent=continent,
        country=country,
        country_region=country_region,
        population_density_id=population_density_id,
        osm_url=osm_url
    )


def select_demographic_groups(pipelines, selected_region):
    d = selected_region['population_density_id']

    if not d and 'population-density' not in pipelines:
        return None

    if d:
        d = Dataset.read_from_hdx(d)
    else:
        d = FileSelector.select_population_file(selected_region['country'])
        d = Dataset.read_from_hdx(d['id'])

    selected = FileSelector.select_demographic_groups(d)

    # Apply json.dumps() twice to escape double quotes
    return json.dumps(json.dumps(selected))
