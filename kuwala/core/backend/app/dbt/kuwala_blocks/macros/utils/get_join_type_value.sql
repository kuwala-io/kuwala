{% macro get_join_type_value(join_type) %}
    {% set value %}
        {%- if join_type == "inner" -%}
            INNER JOIN
        {%- elif join_type == "left" -%}
            LEFT JOIN
        {%- elif join_type == "right" -%}
            RIGHT JOIN
        {%- elif join_type == "full_outer" -%}
            FULL OUTER JOIN
        {%- else -%}
        {%- endif -%}
    {% endset %}

    {% if execute %}
        {% do return(value) %}
    {% endif %}
{% endmacro %}