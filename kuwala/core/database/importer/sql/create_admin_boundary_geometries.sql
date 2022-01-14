UPDATE admin_boundary
SET geometry = st_geomfromgeojson(geo_json)