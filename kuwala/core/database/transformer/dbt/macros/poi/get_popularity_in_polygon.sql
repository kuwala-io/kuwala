{% macro get_popularity_in_polygon(result_path, polygon_coords, h3_resolution) %}
    {% set now = modules.datetime.datetime.now().strftime("%m_%d_%YT%H:%M:%S") %}
    {% set popularity = sum_by_id('google_poi_popularity', 'internal_id', ('popularity',)) %}
    {% set h3_indexes_in_polygon = get_h3_indexes_in_polygon(('{"type":"Polygon","coordinates":' + polygon_coords + '}'), h3_resolution) %}

    {% set query %}
        SELECT h3_to_parent(h3_index::h3index, {{ h3_resolution }}) AS h3_index, SUM(popularity) AS popularity
        FROM ({{ popularity }}) AS popularity
            LEFT JOIN google_poi USING (internal_id)
        WHERE h3_to_parent(h3_index::h3index, {{ h3_resolution }}) IN ({{ h3_indexes_in_polygon }})
        GROUP BY h3_to_parent(h3_index::h3index, {{ h3_resolution }})
    {% endset%}

    {% set results = run_query(query) %}
    {% do results.to_csv(result_path + '/macros/poi/get_popularity_in_polygon/' + now + '_get_popularity_in_polygon.csv') %}

    {{ return(results) }}
{% endmacro %}