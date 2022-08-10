SELECT DISTINCT poi_id, city_name
FROM {{ ref('cities') }} AS cities, {{ ref('poi_matched') }} AS poi
WHERE st_contains(cities.geometry, st_setsrid(st_makepoint(poi.longitude, poi.latitude), 4326))
