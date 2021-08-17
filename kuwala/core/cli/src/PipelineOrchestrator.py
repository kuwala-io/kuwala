import logging
import subprocess


def run_command(command: [str]):
    process = subprocess.Popen(command, stdout=subprocess.PIPE, universal_newlines=True, shell=True)

    while True:
        line = process.stdout.readline()

        if len(line.strip()) > 0:
            print(line if 'Stage' not in line and '%' not in line else line.strip(), end='\r')

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


def run_osm_poi_pipeline(url, continent, country, country_region):
    continent_arg = f'--continent={continent}' if continent else ''
    country_arg = f'--country={country}' if country else ''
    country_region_arg = f'--country_region={country_region}' if country_region else ''
    run_command([f'docker-compose run osm-poi --action=download --url={url} {continent_arg} {country_arg} '
                 f'{country_region_arg}'])
    run_command([f'docker-compose run osm-parquetizer java -jar target/osm-parquetizer-1.0.1-SNAPSHOT.jar '
                 f'{continent_arg} {country_arg} {country_region_arg}'])
    run_command([f'docker-compose run osm-poi --action=process {continent_arg} {country_arg} {country_region_arg}'])


def run_google_poi_pipeline(continent, country, country_region):
    logging.info('Running Google POI')


def run_population_density_pipeline(continent, country, demographic_groups):
    run_command([f'docker-compose run population-density --continent={continent} --country={country} '
                 f'--demographic_groups={demographic_groups}'])


def run_pipelines(pipelines: [str], selected_region: dict):
    continent = selected_region['continent']
    country = selected_region['country']
    country_region = selected_region['country_region']

    if 'google-poi' in pipelines or 'osm-poi' in pipelines:
        run_osm_poi_pipeline(selected_region['osm_url'], continent, country, country_region)

    if 'google-poi' in pipelines:
        run_google_poi_pipeline(continent, country, country_region)

    if 'population-density' in pipelines:
        run_population_density_pipeline(continent, country, selected_region['demographic_groups'])
