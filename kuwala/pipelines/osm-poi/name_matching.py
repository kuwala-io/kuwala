import urllib.request as req
import zipfile
import os
import json


# here, instead of cloning the repository that recommended using extra library,
# we download the whole repo
if not os.path.exists('./tmp/name-suggestion-index-main'):
    download_link='https://github.com/osmlab/name-suggestion-index/archive/refs/heads/main.zip'
    req.urlretrieve(download_link, "./tmp/main.zip")
    with zipfile.ZipFile('./tmp/main.zip', 'r') as zip_ref:
        zip_ref.extractall('./tmp/')
    os.remove('./tmp/main.zip')

file_paths='./tmp/name-suggestion-index-main/data/brands'
data = {'id': [], 'display_name': [], 'wiki_data': []}
for folders in os.listdir(file_paths):
    #print(folders)
    if os.path.isdir(os.path.join(file_paths,folders)):
        for files in os.listdir(os.path.join(file_paths,folders)):
            #print(files)
            f=open(os.path.join(file_paths,folders,files))
            file_content=json.load(f)
            for a in file_content['items'] : 
                print(a)
                #print(a)
                # if a['id'] == [] : break
                # data['id'].append(a['id'])
                # data['display_name'].append(a['displayName'])



print(data)