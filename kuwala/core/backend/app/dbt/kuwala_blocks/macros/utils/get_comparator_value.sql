{% macro get_comparator_value(comparator) %}
    {% set value %}
        {%- if comparator == "equal" -%}
            =
        {%- elif comparator == "not_equal" -%}
            !=
        {%- elif comparator == "less" -%}
            <
        {%- elif comparator == "greater" -%}
            >
        {%- elif comparator == "less_or_equal" -%}
            <=
        {%- elif comparator == "greater_or_equal" -%}
            >=
        {%- else -%}
        {%- endif -%}
    {% endset %}

    {% if execute %}
        {% do return(value) %}
    {% endif %}
{% endmacro %}