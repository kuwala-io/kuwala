SELECT concat_ws('_', osm_type, osm_id) AS osm_id, internal_id, confidence
FROM google_osm_poi_matching