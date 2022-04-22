{% macro add_columns(dbt_model, columns, result_name) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {%- set calculation -%}
        {% for column in columns %}{{ column }} + {% endfor %}
    {%- endset -%}

    {% set query %}
        -- KUWALA_TRANSFORMATION_START
        SELECT *, {{ calculation[:-3] }} AS {{ result_name }}
        FROM {{ rel }}
        -- KUWALA_TRANSFORMATION_END
    {% endset %}

    {% if execute %}
        {{ log(query, info=True) }}
        {% do return(query) %}
    {% endif %}
{% endmacro %}