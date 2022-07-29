{% macro get_all_versions_of_city_names(country_code) %}
    {% set query %}
        SELECT DISTINCT geoname_id, unnest(ascii_name || alternate_names) AS name
        FROM admin_boundary_geonames_cities
        WHERE country_code = '{{ country_code }}'
    {% endset %}

    {{ return(query) }}
{% endmacro %}