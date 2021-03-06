{% macro filter_by_regex(dbt_model, block_columns, column, regex) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {% set query %}
        SELECT *
        FROM {{ rel }}
        {% if target.type == 'bigquery' %}
            WHERE REGEXP_CONTAINS({{ column }}, '{{ decode_yaml_parameter(regex) }}')
        {% else %}
            WHERE {{ column }} ~ '{{ decode_yaml_parameter(regex) }}'
        {% endif %}
    {% endset %}

    {% set result = get_result_query(block_columns, query) %}

    {% if execute %}
        {{ log(result, info=True) }}
        {% do return(result) %}
    {% endif %}
{% endmacro %}