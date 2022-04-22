{% macro join_by_id(dbt_model_left, dbt_model_right, column_left, column_right, join_type) %}
    {% set join_type_value = get_join_type_value(join_type) %}
    {% set join_condition = get_join_condition(column_left, column_right) %}
    {% set rel_left = '{{ ref("' + dbt_model_left + '") }}' %}
    {% set rel_right = '{{ ref("' + dbt_model_right + '") }}' %}

    {% set query %}
        -- KUWALA_TRANSFORMATION_START
        SELECT *
        FROM {{ rel_left }} AS rel1 {{ join_type_value }} {{ rel_right }} AS rel2 {{ join_condition }}
        -- KUWALA_TRANSFORMATION_END
    {% endset %}

    {% if execute %}
        {{ log(query, info=True) }}
        {% do return(query) %}
    {% endif %}
{% endmacro %}