{% macro join_by_id(block_columns, dbt_model_left, dbt_model_right, column_left, column_right, join_type) %}
    {% set join_type_value = get_join_type_value(join_type) %}
    {% set join_condition = get_join_condition(column_left, column_right) %}
    {% set rel_left = '{{ ref("' + dbt_model_left + '") }}' %}
    {% set rel_right = '{{ ref("' + dbt_model_right + '") }}' %}

    {% set query %}
        SELECT *
        FROM {{ rel_left }} AS rel1 {{ join_type_value }} {{ rel_right }} AS rel2 {{ join_condition }}
    {% endset %}

    {% set result = get_result_query(block_columns, query) %}

    {% if execute %}
        {{ log(result, info=True) }}
        {% do return(result) %}
    {% endif %}
{% endmacro %}