import os
import questionary
import zipfile
from hdx.data.dataset import Dataset
from hdx.data.organization import Organization
from hdx.data.resource import Resource
from hdx.hdx_configuration import Configuration
from pathlib import Path


class Downloader:
    @staticmethod
    def start() -> [dict]:
        dataset = Downloader.select_dataset()
        files, output_dir = Downloader.download_files(dataset)

        return files, output_dir

    @staticmethod
    def select_dataset() -> dict:
        Configuration.create(hdx_site='prod', user_agent='Kuwala', hdx_read_only=True)
        # The identifier is for Facebook. This shouldn't change from HDX's side in the future since it's an id.
        datasets = Organization.read_from_hdx(identifier='74ad0574-923d-430b-8d52-ad80256c4461').get_datasets(
            query='Population')
        datasets = sorted(
            filter(
                lambda d: 'population' in d['title'].lower() and 'csv' in d['file_types'],
                map(
                    lambda d: dict(id=d.get('id'), title=d.get('title'), location=d.get_location_names(),
                                   country_code=d.get_location_iso3s(), file_types=d.get_filetypes()),
                    datasets
                )
            ), key=lambda d: d['location'][0])
        countries = list(map(lambda d: d['location'][0], datasets))
        country = questionary \
            .select('For which country do you want to download the population data?', choices=countries) \
            .ask()

        return datasets[countries.index(country)]

    @staticmethod
    def download_files(d: dict) -> [str]:
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
            lambda resource: resource['format'].lower() == 'csv',
            map(
                lambda resource: dict(
                    id=resource.get('id'),
                    format=resource.get('format'),
                    type=get_type(resource.get('name'))
                ),
                resources
            )
        ))
        resource_names = list(map(lambda resource: resource['type'], resources))
        selected_resources = questionary \
            .checkbox('Which demographic groups do you want to include?', choices=resource_names) \
            .ask()
        selected_resources = list(filter(lambda resource: resource['type'] in selected_resources, resources))
        country_code = d.get_location_iso3s()[0]
        script_dir = os.path.dirname(__file__)
        dir_path = f'../tmp/{country_code}/'
        dir_path = os.path.join(script_dir, dir_path)
        file_paths = list()

        for r in selected_resources:
            r_hdx = Resource().read_from_hdx(identifier=r['id'])
            dir_path_type = f'{dir_path}{r["type"]}/'

            file_paths.append(dict(path=dir_path_type, type=r['type']))

            if not os.path.exists(dir_path_type):
                Path(dir_path_type).mkdir(parents=True, exist_ok=True)

                url, file_path = r_hdx.download(dir_path_type)
                file_path_without_ext = file_path.replace('.CSV', '')

                os.rename(file_path, file_path_without_ext)

                with zipfile.ZipFile(file_path_without_ext, 'r') as zip_ref:
                    zip_ref.extractall(dir_path_type)

                os.remove(file_path_without_ext)

        return file_paths, dir_path
