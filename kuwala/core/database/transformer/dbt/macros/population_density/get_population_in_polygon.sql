{% macro get_population_in_polygon(result_path, geo_json, h3_resolution) %}
    {% set now = modules.datetime.datetime.now().strftime("%m_%d_%YT%H:%M:%S") %}
    {% set population = sum_by_h3('population_density', ('total', 'children_under_five', 'elderly_60_plus', 'men', 'women', 'women_of_reproductive_age_15_49', 'youth_15_24'), h3_resolution) %}
    {% set h3_indexes_in_polygon = get_h3_indexes_in_polygon('{"type":"Polygon","coordinates":[[[14.47071075439453,35.876045770595184],[14.53147888183594,35.876045770595184],[14.53147888183594,35.920613151598],[14.47071075439453,35.920613151598],[14.47071075439453,35.876045770595184]]]}', h3_resolution) %}

    {% set query %}
        SELECT *
        FROM ({{ h3_indexes_in_polygon }}) AS h3_indexes_in_polygon
        LEFT JOIN ({{ population }}) AS population
        USING (h3_index)
        WHERE total IS NOT NULL
    {% endset%}

    {% set results = run_query(query) %}
    {% do results.to_csv(result_path + '/macros/population_density/get_population_in_polygon/' + now + '_get_population_in_polygon.csv') %}

    {{ return(results) }}
{% endmacro %}