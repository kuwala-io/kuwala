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

def word_contains_x(x:str, word:str)->str:
    if x in word:
        return word

def get_category(tag:str, cat_data:dict):
    return [cat for cat in cat_data.keys() if any(word_contains_x(tag, word=x) for x in cat_data[cat]['tags'])]

def complete_categories(poi_cat: List[str], kuwala_to_poi:dict) -> dict:
    categories = {'google': poi_cat}
    kuwala_tags = [get_category(tag, cat_data=kuwala_to_poi) for tag in poi_cat]
    categories['kuwala'] = sorted(set(itertools.chain(*kuwala_tags)))
    return categories

