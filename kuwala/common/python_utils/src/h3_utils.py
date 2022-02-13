import geojson
import h3


def polyfill_polygon(polygon: geojson.Polygon, resolution):
    h3_indexes = h3.polyfill(
        dict(type=polygon.type, coordinates=polygon.coordinates),
        resolution,
        geo_json_conformant=True,
    )

    return h3_indexes
