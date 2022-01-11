{% macro get_pois_in_polygon(result_path, category, geo_json, h3_resolution) %}
    {% set now = modules.datetime.datetime.now().strftime("%m_%d_%YT%H:%M:%S") %}
    {% set where_clause = "WHERE poi_categories_osm LIKE '%" + category + "%'" %}
    {% set pois = count_by_h3(table='dbt.poi', where_clause=where_clause, h3_resolution=h3_resolution, h3_column='poi_h3_index') %}
    {% set h3_indexes_in_polygon = get_h3_indexes_in_polygon('{"type":"Polygon","coordinates":[[[14.47071075439453,35.876045770595184],[14.53147888183594,35.876045770595184],[14.53147888183594,35.920613151598],[14.47071075439453,35.920613151598],[14.47071075439453,35.876045770595184]]]}', h3_resolution) %}

    {% set query %}
        SELECT *
        FROM ({{ h3_indexes_in_polygon }}) AS h3_indexes_in_polygon
        LEFT JOIN ({{ pois }}) AS pois
        USING (h3_index)
        WHERE count IS NOT NULL
    {% endset%}

    {% set results = run_query(query) %}
    {% do results.to_csv(result_path + '/macros/poi/get_pois_in_polygon/' + now + '_get_pois_in_polygon.csv') %}

    {{ return(results) }}
{% endmacro %}