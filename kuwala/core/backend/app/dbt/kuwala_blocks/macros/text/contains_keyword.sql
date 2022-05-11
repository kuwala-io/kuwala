{% macro contains_keyword(dbt_model, block_columns, column, keyword) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {% set query %}
        SELECT *
        FROM {{ rel }}
        WHERE {{ column }} LIKE '%{{ decode_yaml_parameter(keyword) }}%'
    {% endset %}

    {% set result = get_result_query(block_columns, query) %}

    {% if execute %}
        {{ log(result, info=True) }}
        {% do return(result) %}
    {% endif %}
{% endmacro %}