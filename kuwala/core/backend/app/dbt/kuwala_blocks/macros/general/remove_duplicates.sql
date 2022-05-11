{% macro remove_duplicates(dbt_model, block_columns) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {% set query %}
        SELECT DISTINCT *
        FROM {{ rel }}
    {% endset %}

    {% set result = get_result_query(block_columns, query) %}

    {% if execute %}
        {{ log(result, info=True) }}
        {% do return(result) %}
    {% endif %}
{% endmacro %}