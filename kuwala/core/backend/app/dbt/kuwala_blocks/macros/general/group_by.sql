{% macro group_by(dbt_model, block_columns, group_by_columns, aggregated_columns) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}
    {% set group_by_columns_string = get_columns_string(group_by_columns) %}
    {% set aggregated_columns_string = get_aggregated_columns_string(aggregated_columns) %}

    {% set query %}
        SELECT {{ group_by_columns_string }}, {{ aggregated_columns_string }}
        FROM {{ rel }}
        GROUP BY {{ group_by_columns_string }}
    {% endset %}

    {% set result = get_result_query(block_columns, query) %}

    {% if execute %}
        {{ log(result, info=True) }}
        {% do return(result) %}
    {% endif %}
{% endmacro %}