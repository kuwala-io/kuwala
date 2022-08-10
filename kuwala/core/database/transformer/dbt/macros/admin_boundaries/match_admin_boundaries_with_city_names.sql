{% macro match_admin_boundaries_with_city_names(country_code) %}
    {% set all_versions_of_city_names = get_all_versions_of_city_names(country_code) %}

    {% set query %}
        SELECT id, geoname_id, levenshtein(ab.name, avocn.name) AS levenshtein_distance
        FROM admin_boundary AS ab LEFT JOIN ({{ all_versions_of_city_names }}) AS avocn ON
            ab.name = avocn.name OR
            unaccent(ab.name) = avocn.name OR
            ab.name LIKE avocn.name || '%' OR
            unaccent(ab.name) LIKE avocn.name || '%'
    {% endset %}

    {{ return(query) }}
{% endmacro %}