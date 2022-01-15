{% macro get_column_names(table) %}
    {% set query %}
        SELECT *
        FROM {{ table }}
        LIMIT 0
    {% endset %}

    {% set column_names_result = run_query(query) %}

    {% if execute %}
        {% set column_names = column_names_result.column_names %}
    {% else %}
        {% set column_names = [] %}
    {% endif %}

    {{ return(column_names) }}
{% endmacro %}