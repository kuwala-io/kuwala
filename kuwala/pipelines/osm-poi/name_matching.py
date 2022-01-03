import urllib.request as req
import zipfile
import os


# here, instead of cloning the repository that recommended using extra library,
# we download the whole repo
if not os.path.exists('./tmp/name-suggestion-index-main'):
    download_link='https://github.com/osmlab/name-suggestion-index/archive/refs/heads/main.zip'
    req.urlretrieve(download_link, "./tmp/main.zip")
    with zipfile.ZipFile('./tmp/main.zip', 'r') as zip_ref:
        zip_ref.extractall('./tmp/')
    os.remove('./tmp/main.zip')


