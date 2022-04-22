{% macro get_join_condition(column_left, column_right) %}
    {% set value %}
        {%- if column_left == column_right -%}
            USING({{ column_left }})
        {%- else -%}
            ON rel1.{{ column_left }} = rel2.{{ column_right }}
        {%- endif -%}
    {% endset %}

    {% if execute %}
        {% do return(value) %}
    {% endif %}
{% endmacro %}