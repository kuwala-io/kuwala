import h3
import json
from thefuzz import fuzz
from pyspark.sql.functions import udf
from pyspark.sql.types import ArrayType, DoubleType, FloatType, IntegerType, StringType, StructField, StructType
from shapely.geometry import shape

DEFAULT_RESOLUTION = 11


# Get H3 index for coordinates pair
@udf(returnType=StringType())
def get_h3_index(lat: str, lng: str, resolution):
    try:
        # noinspection PyUnresolvedReferences
        return h3.geo_to_h3(float(lat), float(lng), resolution)
    except TypeError:
        return None


# Get number of H3 cells in between to given cells of the same resolution
@udf(returnType=IntegerType())
def get_h3_distance(h1: str, h2: str, default_value):
    try:
        # noinspection PyUnresolvedReferences
        return h3.h3_distance(h1, h2)
    except h3.H3ValueError:
        return default_value


# Get parent index for a specific resolution
@udf(returnType=StringType())
def h3_to_parent(h3_index: str, resolution: int):
    # noinspection PyUnresolvedReferences
    return h3.h3_to_parent(h3_index, resolution)


# Create a GeoJSON string based on an array of coordinates
@udf(returnType=StringType())
def create_geo_json_based_on_coordinates(coordinates: [[float]]):
    if not coordinates or len(coordinates) < 1:
        return

    last_index = len(coordinates) - 1
    geo_json_type = 'Polygon'

    if (coordinates[0][0] != coordinates[last_index][0]) or (coordinates[0][1] != coordinates[last_index][1]):
        geo_json_type = 'LineString'

    geo_json_coordinates = [coordinates] if geo_json_type == 'Polygon' else coordinates

    return json.dumps(dict(type=geo_json_type, coordinates=geo_json_coordinates))


# Get the centroid of a GeoJSON string
@udf(returnType=StructType([
    StructField(name='latitude', dataType=FloatType()), StructField(name='longitude', dataType=FloatType())
]))
def get_centroid_of_geo_json(geo_json: str):
    if geo_json:
        geo_json = json.loads(geo_json)

        try:
            centroid = shape(geo_json).centroid

            return dict(latitude=centroid.y, longitude=centroid.x)
        except ValueError:
            return
        except IndexError:
            return


# Get a similarity score for two strings
@udf(returnType=IntegerType())
def get_string_distance(compare_str: str, base_str: str, alternative_base_str: str):
    if base_str:
        return fuzz.token_set_ratio(base_str, compare_str)

    return fuzz.token_set_ratio(alternative_base_str, compare_str)


# Map a list of key-value-pairs to a list of strings
@udf(returnType=ArrayType(elementType=StringType()))
def concat_list_of_key_value_pairs(tags):
    return list(map(lambda t: f'{t["key"]}={t["value"]}', tags))


# Calculate the confidence of a Google result based on the name and H3 distance"""
@udf(returnType=DoubleType())
def get_confidence_based_h3_and_name_distance(h3_distance: int, name_distance: int, max_h3_distance: int):
    def get_h3_confidence(d):
        if d <= 25:
            return 1

        return 1 - d / max_h3_distance if d < max_h3_distance else 0

    def get_name_confidence(d):
        return d / 100

    h3_confidence = get_h3_confidence(h3_distance)
    name_confidence = get_name_confidence(name_distance)

    return h3_confidence * (2 / 3) + name_confidence * (1 / 3)


# Based on the confidence build the POI id using the H3 index and OSM id
@udf(returnType=StringType())
def build_poi_id_based_on_confidence(confidence, h3_index_google, h3_index_osm, osm_id):
    if confidence and confidence >= 0.9:
        return f'{h3_index_google}_{osm_id}'

    return f'{h3_index_osm}_{osm_id}'
