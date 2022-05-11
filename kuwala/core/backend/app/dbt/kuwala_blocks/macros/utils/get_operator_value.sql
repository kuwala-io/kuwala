{% macro get_operator_value(operator) %}
    {% set value %}
        {%- if operator == "add" -%}
            +
        {%- elif operator == "subtract" -%}
            -
        {%- elif operator == "multiply" -%}
            *
        {%- elif operator == "divide" -%}
            /
        {%- else -%}
        {%- endif -%}
    {% endset %}

    {% if execute %}
        {% do return(value) %}
    {% endif %}
{% endmacro %}