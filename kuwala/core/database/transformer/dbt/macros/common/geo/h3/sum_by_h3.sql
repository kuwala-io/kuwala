{% macro sum_by_h3(table, columns_to_include, h3_resolution) %}
    {% set query %}
        SELECT
            h3_to_parent(h3_index::h3index, {{ h3_resolution }}) AS h3_index,
            {% for column in columns_to_include %}
                SUM({{ column }}) AS {{ column }}
                {%- if not loop.last %},{% endif -%}
            {% endfor %}
        FROM {{ table }}
        GROUP BY h3_to_parent(h3_index::h3index, {{ h3_resolution }})
    {% endset %}

    {{ return(query) }}
{% endmacro %}