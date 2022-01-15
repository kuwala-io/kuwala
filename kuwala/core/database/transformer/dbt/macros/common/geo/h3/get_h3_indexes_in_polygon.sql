{% macro get_h3_indexes_in_polygon(geo_json, h3_resolution) %}
    {% set query %}
        SELECT h3_polyfill(st_geomfromgeojson('{{ geo_json }}'), {{ h3_resolution }}) AS h3_index
    {% endset %}

    {{ return(query) }}
{% endmacro %}