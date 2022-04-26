{% macro text_to_number(dbt_model, block_columns, column) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}
    {% set column_names = get_column_names(dbt_model) %}
    {% set columns_string = get_columns_string(column_names, column) %}
    {% set casted_column = try_cast('"' + column + '"', 'int') %}

    {% set query %}
        SELECT {{ columns_string }}, {{ casted_column }} AS {{ column }}
        FROM {{ rel }}
    {% endset %}

    {% set result = get_result_query(block_columns, query) %}

    {% if execute %}
        {{ log(result, info=True) }}
        {% do return(result) %}
    {% endif %}
{% endmacro %}