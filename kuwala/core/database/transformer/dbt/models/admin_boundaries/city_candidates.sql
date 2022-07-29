SELECT
    abgc.ascii_name AS city_name,
    ab.name AS admin_boundary_name,
    min_levenshtein_distance,
    ab.geometry AS geometry,
    abgc.latitude AS candidate_latitude,
    abgc.longitude AS candidate_longitude
FROM (
    SELECT id, geoname_id, levenshtein_distance
    FROM ({{ match_admin_boundaries_with_city_names(var('country')) }}) AS mabwcn
    WHERE geoname_id IS NOT NULL AND levenshtein_distance < 10
) AS matched_cities
INNER JOIN (
    SELECT id AS id_best_match, MIN(levenshtein_distance) AS min_levenshtein_distance
    FROM ({{ match_admin_boundaries_with_city_names(var('country')) }}) AS mabwcn
    WHERE geoname_id IS NOT NULL AND levenshtein_distance < 10
    GROUP BY id
) AS matched_cities_min_levenshtein_distances ON
    matched_cities.id = matched_cities_min_levenshtein_distances.id_best_match AND
    matched_cities.levenshtein_distance = matched_cities_min_levenshtein_distances.min_levenshtein_distance
LEFT JOIN admin_boundary_geonames_cities AS abgc USING (geoname_id)
LEFT JOIN admin_boundary AS ab USING (id)