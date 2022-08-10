SELECT city_name, geometry
FROM {{ ref('city_candidates') }}
INNER JOIN (
    SELECT city_name AS city_name_best_match, MIN(min_levenshtein_distance) AS min_levenshtein_distance_best_match
    FROM {{ ref('city_candidates') }}
    GROUP BY city_name
) AS best_city_candidates ON
    city_candidates.city_name = best_city_candidates.city_name_best_match AND
    city_candidates.min_levenshtein_distance = best_city_candidates.min_levenshtein_distance_best_match
WHERE st_contains(geometry, st_setsrid(st_makepoint(candidate_longitude, candidate_latitude), 4326))