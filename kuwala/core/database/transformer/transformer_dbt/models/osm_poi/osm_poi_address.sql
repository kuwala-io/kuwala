WITH full_address AS (
    SELECT osm_type, osm_id, address_full AS address
    FROM osm_poi
    WHERE address_full IS NOT NULL
),

with_address_tags AS (
    SELECT osm_type, osm_id, address_street, address_house_nr, address_zip_code, address_city, address_country
    FROM osm_poi
    WHERE address_full IS NULL AND (
        address_street IS NOT NULL OR
        address_zip_code IS NOT NULL OR
        address_city IS NOT NULL OR
        address_country IS NOT NULL
    )
),

address_components AS (
    SELECT
        osm_type,
        osm_id,
        CASE WHEN address_street IS NOT NULL OR address_house_nr IS NOT NULL
            THEN concat_ws(' ', address_street, address_house_nr)
        END AS street_component,
        CASE WHEN address_zip_code IS NOT NULL OR address_city IS NOT NULL
            THEN concat_ws(' ', address_zip_code, address_city)
        END AS city_component,
        address_country
    FROM with_address_tags
),

combined_address AS (
    SELECT osm_type, osm_id, concat_ws(', ', street_component, city_component, address_country) AS address
    FROM address_components
)

SELECT * FROM combined_address
UNION
SELECT * FROM full_address
