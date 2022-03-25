{% macro add_columns(dbt_model, columns, result_name) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {%- set calculation -%}
        {% for column in columns %}{{ column }} + {% endfor %}
    {%- endset -%}

    {% set query %}
        -- KUWALA TRANSFORMATION
        SELECT *, {{ calculation[:-3] }} AS {{ result_name }}
        FROM {{ rel }}
    {% endset %}

    {% if execute %}
        {{ log(query, info=True) }}
        {% do return(query) %}
    {% endif %}
{% endmacro %}