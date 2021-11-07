SELECT country.poi_id, poi_address_city, poi_address_country
FROM
    (SELECT poi_id, array_to_string(array_agg(ab.name ORDER BY ab.kuwala_admin_level DESC), ', ') AS poi_address_country
    FROM admin_boundary AS ab, {{ ref('poi_matched') }}
    WHERE
        kuwala_admin_level = 1 AND
        st_contains(
            ab.geometry,
            st_setsrid(st_makepoint(poi_matched.longitude, poi_matched.latitude),
                4326)
        )
    GROUP BY poi_id) AS country
LEFT JOIN
    (SELECT poi_id, array_to_string(array_agg(ab.name ORDER BY ab.kuwala_admin_level DESC), ', ') AS poi_address_city
    FROM admin_boundary AS ab, {{ ref('poi_matched') }}
    WHERE
        kuwala_admin_level > 1 AND
        st_contains(
            ab.geometry,
            st_setsrid(st_makepoint(poi_matched.longitude, poi_matched.latitude),
                4326)
        )
    GROUP BY poi_id) AS city
USING (poi_id)
