import os
import json
import itertools
from typing import List

CURDIR = os.path.abspath(os.path.curdir)
idx=CURDIR.split(os.sep).index('src')
POI_PATH = (os.sep).join(CURDIR.split(os.sep)[:idx])
CAT_PATH = os.path.join(POI_PATH, 'resources', 'categories.json')


with open(CAT_PATH, 'r') as j:
    kuwala_to_poi = json.load(j)

def get_category(tag, cat_data):
    return [cat for cat in cat_data.keys() if any(tag == x for x in cat_data[cat]['tags'])]

def complete_categories(poi_cat: List[str], kuwala_to_poi:dict) -> dict:
    categories = {'google': poi_cat}
    if poi_cat==[]:
        categories['kuwala']=[]
    else:
        kuwala_tags = [get_category(tag, cat_data=kuwala_to_poi) for tag in poi_cat]
        if any(kuwala_tags):
            categories['kuwala'] = sorted(set(itertools.chain(*kuwala_tags)))
        else:
            categories['kuwala']=['misc']
    return categories

