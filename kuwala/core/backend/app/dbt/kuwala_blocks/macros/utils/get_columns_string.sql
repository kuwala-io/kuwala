{% macro get_columns_string(columns, except='') %}
    {%- set value -%}
        {% for column in columns %}{% set decoded_column = decode_yaml_parameter(column) %}{% if decoded_column != except %}{{ decoded_column }}, {% endif %}{% endfor %}
    {%- endset -%}

    {% if execute %}
        {% do return(value[:-2]) %}
    {% endif %}
{% endmacro %}