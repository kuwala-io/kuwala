{% macro get_population_in_polygon(result_path, polygon_coords, h3_resolution) %}
    {% set now = modules.datetime.datetime.now().strftime("%m_%d_%YT%H:%M:%S") %}
    {% set population = sum_by_h3('population_density', ('total', 'children_under_five', 'elderly_60_plus', 'men', 'women', 'women_of_reproductive_age_15_49', 'youth_15_24'), h3_resolution) %}
    {% set h3_indexes_in_polygon = get_h3_indexes_in_polygon(('{"type":"Polygon","coordinates":' + polygon_coords + '}'), h3_resolution) %}

    {% set query %}
        SELECT *
        FROM ({{ population }}) AS population
        WHERE h3_index IN ({{ h3_indexes_in_polygon }})
    {% endset%}

    {% set results = run_query(query) %}
    {% do results.to_csv(result_path + '/macros/population_density/get_population_in_polygon/' + now + '_get_population_in_polygon.csv') %}

    {{ return(results) }}
{% endmacro %}