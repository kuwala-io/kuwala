SELECT
    (CASE WHEN osm_id IS NOT NULL
        THEN concat_ws('_', osm_poi.h3_index, osm_id)
        ELSE concat_ws('_', google_poi.h3_index, custom_id)
    END) AS poi_id,
    custom_id AS external_poi_id,
    (CASE WHEN google_custom_poi_matching.confidence IS NOT NULL
        THEN google_custom_poi_matching.confidence
        ELSE google_osm_poi_matching.confidence
    END) AS poi_confidence_google,
    place_id AS poi_google_place_id,
    (CASE WHEN osm_poi.h3_index IS NOT NULL
        THEN osm_poi.h3_index
        ELSE google_poi.h3_index
    END) AS poi_h3_index,
    (CASE WHEN osm_poi.latitude IS NOT NULL
        THEN osm_poi.latitude
        ELSE google_poi.latitude
    END) AS latitude,
    (CASE WHEN osm_poi.longitude IS NOT NULL
        THEN osm_poi.longitude
        ELSE google_poi.longitude
    END) AS longitude,
    google_poi.name AS poi_name_google,
    osm_poi.name AS poi_name_osm,
    array_to_string(osm_poi.categories, ',') AS poi_categories_osm,
    array_to_string(google_poi.categories, ',') AS poi_categories_google,
    array_to_string(tags, ',') AS poi_categories_google_raw,
    osm_poi.address AS poi_address_osm,
    array_to_string(google_poi.address, ', ') AS poi_address_google,
    number_of_reviews AS poi_reviews,
    rating_stars AS poi_rating,
    price_level AS poi_price_level,
    opening_time_total AS poi_opening_time_total,
    popularity_total AS poi_popularity_total,
    popularity_morning_total AS poi_popularity_morning_total,
    popularity_noon_total AS poi_popularity_noon_total,
    popularity_afternoon_total AS poi_popularity_afternoon_total,
    popularity_evening_total AS poi_popularity_evening_total,
    (temporarily_closed OR permanently_closed) AS poi_closed,
    permanently_closed AS poi_closed_permanently,
    spending_time AS poi_spending_time,
    waiting_time_total AS poi_waiting_time,
    inside_of AS poi_inside_of,
    15 AS h3_resolution
FROM {{ ref('osm_poi') }}
    LEFT JOIN {{ ref('google_osm_poi_matching') }} USING (osm_id)
    FULL JOIN google_custom_poi_matching USING (internal_id)
    LEFT JOIN {{ ref('google_poi') }} USING (internal_id)