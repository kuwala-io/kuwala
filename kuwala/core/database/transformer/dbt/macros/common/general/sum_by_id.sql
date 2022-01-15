{% macro sum_by_id(table, id, columns_to_include) %}
    {% set query %}
        SELECT
            {{ id }},
            {% for column in columns_to_include %}
                SUM({{ column }}) AS {{ column }}
                {%- if not loop.last %},{% endif -%}
            {% endfor %}
        FROM {{ table }}
        GROUP BY {{ id }}
    {% endset %}

    {{ return(query) }}
{% endmacro %}