import os
import questionary
from hdx.hdx_configuration import Configuration
from hdx.data.dataset import Dataset
from hdx.data.organization import Organization
from hdx.data.resource import Resource
from pathlib import Path


def select_dataset() -> dict:
    Configuration.create(hdx_site='prod', user_agent='Kuwala', hdx_read_only=True)
    datasets = Organization.read_from_hdx(identifier='74ad0574-923d-430b-8d52-ad80256c4461').get_datasets(
        query='Population')
    datasets = sorted(
        filter(
            lambda d: 'population' in d['title'].lower() and 'csv' in d['file_types'],
            map(
                lambda d: dict(id=d.get('id'), title=d.get('title'), location=d.get_location_names(),
                               file_types=d.get_filetypes()),
                datasets
            )
        ), key=lambda d: d['location'][0])
    countries = list(map(lambda d: d['location'][0], datasets))
    country = questionary.select('For which country do you want to download the population data?', choices=countries) \
        .ask()

    return datasets[countries.index(country)]


def download_files(d: dict):
    d = Dataset.read_from_hdx(d['id'])
    resources = d.get_resources()

    def get_type(name: str):
        name = name.lower()

        if ('women' in name) and ('reproductive' not in name):
            return 'women'

        if ('men' in name) and ('women' not in name):
            return 'men'

        if 'children' in name:
            return 'children_under_five'

        if 'youth' in name:
            return 'youth_15_24'

        if 'elderly' in name:
            return 'elderly_60_plus'

        if 'reproductive' in name:
            return 'women_of_reproductive_age_15_49'

        return 'total'

    resources = list(filter(
        lambda r: r['format'].lower() == 'csv',
        map(
            lambda r: dict(id=r.get('id'), format=r.get('format'), type=get_type(r.get('name'))),
            resources
        )
    ))
    resource_names = list(map(lambda r: r['type'], resources))
    selected_resources = questionary.checkbox('Which demographic groups do you want to include?', choices=resource_names).ask()
    selected_resources = list(filter(lambda r: r['type'] in selected_resources, resources))
    country_code = d.get_location_iso3s()[0]
    script_dir = os.path.dirname(__file__)
    dir_path = f'../tmp/{country_code}/'

    Path(dir_path).mkdir(parents=True, exist_ok=True)

    dir_path = os.path.join(script_dir, dir_path)

    for r in selected_resources:
        r_hdx = Resource().read_from_hdx(identifier=r['id'])

        r_hdx.download(dir_path)


if __name__ == '__main__':
    dataset = select_dataset()
    download_files(dataset)
