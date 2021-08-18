import os
import questionary


def select_osm_file(directory):
    continents = os.listdir(directory)
    continent = questionary.select('Which continent are you interested in?', choices=continents).ask()
    continent_path = f'{directory}/{continent}'
    countries = os.listdir(continent_path)
    country = questionary.select('Which country are you interested in?', choices=countries).ask()
    country_path = f'{continent_path}/{country}'

    if 'latest' in country:
        return country_path

    regions = os.listdir(country_path)
    region = questionary.select('Which region are you interested in?', choices=regions).ask()

    if region:
        return f'{country_path}/{region}'
