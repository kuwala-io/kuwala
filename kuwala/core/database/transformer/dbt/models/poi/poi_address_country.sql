SELECT poi_id, name, id
FROM admin_boundary AS ab, {{ ref('poi_matched') }} AS poi
WHERE
    kuwala_admin_level = 1 AND
    st_contains(ab.geometry, st_setsrid(st_makepoint(poi.longitude, poi.latitude), 4326))
