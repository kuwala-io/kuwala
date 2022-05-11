{% macro compare_with_date(dbt_model, block_columns, column, comparator, comparison_date) %}
    {% set comparator_value = get_comparator_value(comparator) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {% set query %}
        SELECT *
        FROM {{ rel }}
        WHERE {{ column }} {{ comparator_value }} '{{ comparison_date }}'
    {% endset %}

    {% set result = get_result_query(block_columns, query) %}

    {% if execute %}
        {{ log(result, info=True) }}
        {% do return(result) %}
    {% endif %}
{% endmacro %}