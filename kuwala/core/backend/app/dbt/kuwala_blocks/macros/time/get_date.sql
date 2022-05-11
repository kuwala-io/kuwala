{% macro get_date(dbt_model, block_columns, column, result_name) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {% set query %}
        SELECT *, DATE({{ column }}) AS {{ result_name }}
        FROM {{ rel }}
    {% endset %}

    {% set result = get_result_query(block_columns, query) %}

    {% if execute %}
        {{ log(result, info=True) }}
        {% do return(result) %}
    {% endif %}
{% endmacro %}