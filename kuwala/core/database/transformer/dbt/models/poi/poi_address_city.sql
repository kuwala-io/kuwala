SELECT poi_id, name, id
FROM admin_boundary AS ab, {{ ref('poi_matched') }} AS poi
WHERE
    kuwala_admin_level = (SELECT max(kuwala_admin_level) FROM admin_boundary) AND
    st_contains(ab.geometry, st_setsrid(st_makepoint(poi.longitude, poi.latitude), 4326))
