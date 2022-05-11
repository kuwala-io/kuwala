{% macro get_result_query(block_columns, query) %}
    {% set block_columns_string = get_columns_string(block_columns) %}

    {% set result %}
        -- KUWALA_TRANSFORMATION_START
        SELECT {{ block_columns_string }}
        FROM ({{ query }}) AS result
        -- KUWALA_TRANSFORMATION_END
    {% endset %}

    {% if execute %}
        {% do return(result) %}
    {% endif %}
{% endmacro %}