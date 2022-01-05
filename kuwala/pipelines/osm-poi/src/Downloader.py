import os
from python_utils.src.FileDownloader import download_file
from python_utils.src.FileSelector import select_osm_file
import urllib.request as req
import zipfile
import json
import pandas as pd

class Downloader:
    @staticmethod
    def start(args):
        file = None

        if args.url is None:
            file = select_osm_file()

        script_dir = os.path.dirname(__file__)
        file_path = os.path.join(script_dir, f'../tmp/osmFiles/pbf/{args.continent or file["continent"]}')

        if args.country or (file and file['country']):
            file_path += f'/{args.country or file["country"]}'

        if args.country_region or (file and file['country_region']):
            file_path += f'/{args.country_region or file["country_region"]}'

        file_path += '.osm.pbf'

        download_file(url=args.url or file['url'], path=file_path)

    def brand_name_downloader():
        # here, instead of cloning the repository that recommended using extra library,
        # we download the whole repo in zip, then extract it.
        if not os.path.exists('./tmp/name-suggestion-index-main'):
            download_link='https://github.com/osmlab/name-suggestion-index/archive/refs/heads/main.zip'
            req.urlretrieve(download_link, "./tmp/main.zip")
            with zipfile.ZipFile('./tmp/main.zip', 'r') as zip_ref:
                zip_ref.extractall('./tmp/')
            os.remove('./tmp/main.zip')

        file_paths='./tmp/name-suggestion-index-main/data/brands'
        data = {'id': [], 'display_name': [], 'wiki_data': []}
        for folders in os.listdir(file_paths):
            if os.path.isdir(os.path.join(file_paths,folders)):
                for files in os.listdir(os.path.join(file_paths,folders)):
                    with open(os.path.join(file_paths,folders,files)) as f:
                        file_content=json.load(f)
                    for a in file_content['items'] :
                        wiki_data=id=display_name='-'
                        if ('id' in a.keys()):
                            id=(dict(a)['id'])
                        if ('displayName' in a.keys()):
                            display_name=(dict(a)['displayName'])
                        if ("tags" in a.keys()):
                            if ('brand:wikidata' in list(a['tags'].keys())):
                                wiki_data=(dict(a["tags"].items())['brand:wikidata'])

                        data['id'].append(id)
                        data['display_name'].append(display_name)
                        data['wiki_data'].append(wiki_data)

        df=pd.DataFrame(data)
        print(df)
        df.to_csv('./tmp/names.csv',index=False)