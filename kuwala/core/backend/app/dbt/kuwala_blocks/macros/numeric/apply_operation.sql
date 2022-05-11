{% macro apply_operation(dbt_model, block_columns, column, operator, value, result_name) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}
    {% set operator_value = get_operator_value(operator) %}

    {% set query %}
        SELECT *, {{ column }} {{ operator_value }} {{ value }} AS {{ result_name }}
        FROM {{ rel }}
    {% endset %}

    {% set result = get_result_query(block_columns, query) %}

    {% if execute %}
        {{ log(result, info=True) }}
        {% do return(result) %}
    {% endif %}
{% endmacro %}