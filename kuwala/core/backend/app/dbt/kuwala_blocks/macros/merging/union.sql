{% macro union(block_columns, dbt_model_left, dbt_model_right) %}
    {% set rel_left = '{{ ref("' + dbt_model_left + '") }}' %}
    {% set rel_right = '{{ ref("' + dbt_model_right + '") }}' %}

    {% set query %}
        SELECT * FROM {{ rel_left }}
        UNION
        SELECT * FROM {{ rel_right }}
    {% endset %}

    {% set result = get_result_query(block_columns, query) %}

    {% if execute %}
        {{ log(result, info=True) }}
        {% do return(result) %}
    {% endif %}
{% endmacro %}