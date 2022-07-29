SELECT
       poi_matched.*,
       poi_address_city.city_name AS poi_address_city,
       poi_address_country.name AS poi_address_country,
       h3_to_parent(poi_h3_index::h3index, 8) AS poi_h3_index_res_8,
       h3_to_parent(poi_h3_index::h3index, 9) AS poi_h3_index_res_9,
       h3_to_parent(poi_h3_index::h3index, 10) AS poi_h3_index_res_10,
       h3_to_parent(poi_h3_index::h3index, 11) AS poi_h3_index_res_11
FROM {{ ref('poi_matched') }}
LEFT JOIN {{ ref('poi_address_city') }} USING (poi_id)
LEFT JOIN {{ ref('poi_address_country') }} USING (poi_id)