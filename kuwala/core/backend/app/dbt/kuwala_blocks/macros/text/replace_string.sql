{% macro replace_string(dbt_model, block_columns, column, old_string, new_string) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}
    {% set column_names = get_column_names(dbt_model) %}
    {% set columns_string = get_columns_string(column_names, column) %}
    {% set new_string_parsed = new_string if new_string else '' %}

    {% set query %}
        SELECT {{ columns_string }}, REPLACE({{ column }}, '{{ old_string }}', '{{ new_string_parsed }}') AS {{ column }}
        FROM {{ rel }}
    {% endset %}

    {% set result = get_result_query(block_columns, query) %}

    {% if execute %}
        {{ log(result, info=True) }}
        {% do return(result) %}
    {% endif %}
{% endmacro %}