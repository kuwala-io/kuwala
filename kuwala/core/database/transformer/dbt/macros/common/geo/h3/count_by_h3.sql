{% macro count_by_h3(table, where_clause, h3_resolution, h3_column='h3_index') %}
    {% set query %}
        SELECT
            h3_to_parent({{ h3_column }}::h3index, {{ h3_resolution }}) AS h3_index,
            COUNT(*) AS count
        FROM {{ table }}
        {{ where_clause }}
        GROUP BY h3_to_parent({{ h3_column }}::h3index, {{ h3_resolution }})
    {% endset %}

    {{ return(query) }}
{% endmacro %}