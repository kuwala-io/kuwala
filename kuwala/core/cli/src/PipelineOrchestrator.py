import logging
import subprocess


def run_command(command: [str]):
    process = subprocess.Popen(command, stdout=subprocess.PIPE, universal_newlines=True, shell=True)

    while True:
        line = process.stdout.readline()

        if len(line.strip()) > 0:
            print(line if 'Stage' not in line else line.strip(), end='\r')

        return_code = process.poll()

        if return_code is not None:
            if return_code != 0:
                for output in process.stderr.readlines():
                    logging.error(output)

                return RuntimeError()

            # Process has finished, read rest of the output
            for output in process.stdout.readlines():
                print(output.strip())

            break


def run_osm_poi_pipeline(continent, country, country_region):
    logging.info('Running OSM POI')


def run_google_poi_pipeline(continent, country, country_region):
    logging.info('Running Google POI')


def run_population_density_pipeline(continent, country, demographic_groups):
    run_command(['docker-compose build population-density'])
    run_command([f'docker-compose run population-density --continent={continent} --country={country} --demographic_groups={demographic_groups}'])


def run_pipelines(pipelines: [str], continent: str, country: str, country_region: str, demographic_groups: str):
    if 'google-poi' in pipelines or 'osm-poi' in pipelines:
        run_osm_poi_pipeline(continent, country, country_region)

    if 'google-poi' in pipelines:
        run_google_poi_pipeline(continent, country, country_region)

    if 'population-density' in pipelines:
        run_population_density_pipeline(continent, country, demographic_groups)
