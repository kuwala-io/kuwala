import glob
import json
import os
from pathlib import Path
import time
import zipfile

from hdx.data.dataset import Dataset
from hdx.data.resource import Resource
from hdx.api.configuration import Configuration
from python_utils.src.FileSelector import (
    get_countries_with_population_data,
    select_demographic_groups,
    select_population_file,
)


class Downloader:
    @staticmethod
    def start(args) -> [dict]:
        if args.continent is not None and args.country is not None:
            dataset = dict(continent=args.continent, country=args.country)
        else:
            dataset = select_population_file()

        files, output_dir, updated_date = Downloader.download_files(dataset, args)

        return files, output_dir, updated_date

    @staticmethod
    def download_files(dataset: dict, args) -> [str]:
        if args.continent is not None and args.country is not None:
            if args.demographic_groups is not None:
                Configuration.create(
                    hdx_site="prod", user_agent="Kuwala", hdx_read_only=True
                )
                selected_resources = json.loads(args.demographic_groups)
            else:
                datasets, countries = get_countries_with_population_data(
                    return_country_code=True
                )
                dataset = datasets[countries.index(args.country)]
                dataset["continent"] = args.continent
                dataset["country"] = args.country
                d = Dataset.read_from_hdx(dataset["id"])
                selected_resources = select_demographic_groups(d)
        else:
            d = Dataset.read_from_hdx(dataset["id"])
            selected_resources = select_demographic_groups(d)

        script_dir = os.path.dirname(__file__)
        dir_path = f'../../../tmp/kuwala/population_files/{dataset["continent"]}/{dataset["country"]}/'
        dir_path = os.path.join(script_dir, dir_path)
        file_paths = list()
        latest_update_date = None

        for r in selected_resources:
            dir_path_type = f'{dir_path}{r["type"]}/'

            file_paths.append(dict(path=dir_path_type, type=r["type"]))
            update_date = r["updated"].replace("-", "_")

            if not latest_update_date:
                latest_update_date = update_date
            elif latest_update_date < update_date:
                latest_update_date = update_date

            if not os.path.exists(dir_path_type):
                r_hdx = Resource().read_from_hdx(identifier=r["id"])
                start_time = time.time()

                Path(dir_path_type).mkdir(parents=True, exist_ok=True)

                url, file_path = r_hdx.download(dir_path_type)
                file_path_without_ext = file_path.replace(".CSV", "")
                os.rename(file_path, file_path_without_ext)

                with zipfile.ZipFile(file_path_without_ext, "r") as zip_ref:
                    zip_ref.extractall(dir_path_type)

                # check the extracted file name as in https://github.com/kuwala-io/kuwala/pull/67#discussion_r774395338
                csv_file = glob.glob(dir_path_type + "*.csv", recursive=True)[0]
                # assuming there will be only one csv file as extract result
                file_path_with_update_date = csv_file.split("/")
                file_path_with_update_date[-1] = (
                    update_date + "_" + file_path_with_update_date[-1]
                )
                file_path_with_update_date = "/".join(file_path_with_update_date)
                os.rename(csv_file, file_path_with_update_date)
                os.remove(file_path_without_ext)

                end_time = time.time()

                print(
                    f'Downloaded data for {r["type"]} in {round(end_time - start_time)} s'
                )

        return file_paths, dir_path, latest_update_date
