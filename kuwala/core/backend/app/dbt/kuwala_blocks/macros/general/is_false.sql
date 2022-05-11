{% macro is_false(dbt_model, block_columns, column) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {% set query %}
        SELECT *
        FROM {{ rel }}
        WHERE {{ column }} = False
    {% endset %}

    {% set result = get_result_query(block_columns, query) %}

    {% if execute %}
        {{ log(result, info=True) }}
        {% do return(result) %}
    {% endif %}
{% endmacro %}