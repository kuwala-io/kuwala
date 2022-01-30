import json
import os
from typing import List


def get_category(tag: str, cat_data: dict) -> str:
    kuwala_cats = [
        cat_data[cat]["category"]
        for cat in cat_data.keys()
        if any(tag == x for x in cat_data[cat]["tags"])
    ]

    if not kuwala_cats:
        return "misc"

    return kuwala_cats[0]


def complete_categories(poi_cat: List[str]) -> dict:
    # load category data
    CURDIR = os.path.abspath(os.path.curdir)
    idx = CURDIR.split(os.sep).index("src")
    POI_PATH = os.sep.join(CURDIR.split(os.sep)[:idx])
    CAT_PATH = os.path.join(POI_PATH, "resources", "categories.json")
    with open(CAT_PATH, "r") as j:
        kuwala_to_poi = json.load(j)

    # update categories
    categories = {"google": poi_cat}

    if not poi_cat:
        categories["kuwala"] = []
    else:
        kuwala_tags_raw = [get_category(tag, cat_data=kuwala_to_poi) for tag in poi_cat]
        kuwala_tags = list(set(kuwala_tags_raw))
        if len(kuwala_tags) >= 2 and "misc" in kuwala_tags:
            kuwala_tags.remove("misc")
        categories["kuwala"] = kuwala_tags

        # attach to 'misc' unmapped poi tags
        misc_poi_tags = [p for k, p in zip(kuwala_tags_raw, poi_cat) if k == "misc"]
        misc_poi_tags = set(misc_poi_tags) - set(kuwala_to_poi["misc"]["tags"])
        if any(misc_poi_tags):
            misc = kuwala_to_poi["misc"]["tags"] + list(misc_poi_tags)
            kuwala_to_poi.update({"misc": {"category": "misc", "tags": misc}})
            # save new category data
            with open(CAT_PATH, "w") as f:
                json.dump(dict(sorted(kuwala_to_poi.items())), f, indent=4)
    return categories
