SELECT
       concat_ws('_', osm_poi.osm_type, osm_poi.osm_id) AS osm_id,
       h3_index,
       latitude,
       longitude,
       replace(name, ';', ' ') AS name,
       categories,
       address
FROM osm_poi LEFT JOIN {{ ref('osm_poi_address') }} USING (osm_type, osm_id)
WHERE cardinality(categories) IS NOT NULL