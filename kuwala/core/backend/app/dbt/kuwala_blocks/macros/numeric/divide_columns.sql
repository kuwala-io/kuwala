{% macro divide_columns(dbt_model, block_columns, dividend_column, divisor_column, result_name) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {% set query %}
        SELECT *, {{ dividend_column }} / {{ divisor_column }} AS {{ result_name }}
        FROM {{ rel }}
    {% endset %}

    {% set result = get_result_query(block_columns, query) %}

    {% if execute %}
        {{ log(result, info=True) }}
        {% do return(result) %}
    {% endif %}
{% endmacro %}