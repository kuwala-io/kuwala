{% macro get_aggregated_columns_string(columns) %}
    {%- set value -%}
        {% for column in columns %}{% set column_agg = column.split('KUWALA_AGG') %}{% set column_name = decode_yaml_parameter(column_agg[0]) %}{{ column_agg[1].upper() }}({{ column_name }}) AS {{ column_name }}, {% endfor %}
    {%- endset -%}

    {% if execute %}
        {% do return(value[:-2]) %}
    {% endif %}
{% endmacro %}