SELECT poi_matched.*, poi_address_city, poi_address_country
FROM {{ ref('poi_matched') }} LEFT JOIN {{ ref('poi_admin_boundary') }} USING (poi_id)