SELECT poi_id, popularity, timestamp
FROM {{ ref('poi') }}
LEFT JOIN google_poi ON place_id = poi_google_place_id
LEFT JOIN google_poi_popularity gpp on google_poi.internal_id = gpp.internal_id
WHERE
    poi_popularity_total IS NOT NULL AND
    timestamp BETWEEN {{ var('start_date') }}::timestamp AND {{ var('end_date', CURRENT_TIME) }}::timestamp
ORDER BY poi_id, timestamp