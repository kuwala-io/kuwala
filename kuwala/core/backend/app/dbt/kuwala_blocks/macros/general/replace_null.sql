{% macro replace_null(dbt_model, block_columns, column, replacement_value) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}
    {% set column_names = get_column_names(dbt_model) %}
    {% set columns_string = get_columns_string(column_names, column) %}

    {% set query %}
        SELECT {{ columns_string }}, CASE WHEN {{ column }} IS NOT NULL THEN {{ column }} ELSE {% if replacement_value is string %}'{{ replacement_value }}'{% else %}{{ replacement_value }}{% endif %} END AS {{ column }}
        FROM {{ rel }}
    {% endset %}

    {% set result = get_result_query(block_columns, query) %}

    {% if execute %}
        {{ log(result, info=True) }}
        {% do return(result) %}
    {% endif %}
{% endmacro %}