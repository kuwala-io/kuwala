import json

from fastapi.encoders import jsonable_encoder


def list_props_to_json_props(base_object: dict, list_parameters: [str]) -> dict:
    jsonable_object = jsonable_encoder(base_object)

    for lp in list_parameters:
        jsonable_object[lp] = json.dumps(jsonable_object[lp])

    return jsonable_object
