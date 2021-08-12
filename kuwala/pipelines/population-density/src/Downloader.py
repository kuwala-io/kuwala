import os
import questionary
import time
import zipfile
import sys

sys.path.insert(0, '../../common/')
sys.path.insert(0, '../')

from hdx.data.dataset import Dataset
from hdx.data.resource import Resource
from pathlib import Path
from python_utils.src.FileSelector import select_population_file


class Downloader:
    @staticmethod
    def start() -> [dict]:
        dataset = select_population_file()
        files, output_dir = Downloader.download_files(dataset)

        return files, output_dir

    @staticmethod
    def download_files(dataset: dict) -> [str]:
        d = Dataset.read_from_hdx(dataset['id'])
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
        script_dir = os.path.dirname(__file__)
        dir_path = f'../tmp/populationFiles/{dataset["continent"]}/{dataset["country"]}/'
        dir_path = os.path.join(script_dir, dir_path)
        file_paths = list()

        for r in selected_resources:
            r_hdx = Resource().read_from_hdx(identifier=r['id'])
            dir_path_type = f'{dir_path}{r["type"]}/'

            file_paths.append(dict(path=dir_path_type, type=r['type']))

            if not os.path.exists(dir_path_type):
                start_time = time.time()

                Path(dir_path_type).mkdir(parents=True, exist_ok=True)

                url, file_path = r_hdx.download(dir_path_type)
                file_path_without_ext = file_path.replace('.CSV', '')

                os.rename(file_path, file_path_without_ext)

                with zipfile.ZipFile(file_path_without_ext, 'r') as zip_ref:
                    zip_ref.extractall(dir_path_type)

                os.remove(file_path_without_ext)

                end_time = time.time()

                print(f'Downloaded data for {r["type"]} in {round(end_time - start_time)} s')

        return file_paths, dir_path
