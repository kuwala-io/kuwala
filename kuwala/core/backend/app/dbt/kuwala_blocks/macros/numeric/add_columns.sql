{% macro add_columns(dbt_model, block_columns, columns, result_name) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {%- set calculation -%}
        {% for column in columns %}{{ column }} + {% endfor %}
    {%- endset -%}

    {% set query %}
        SELECT *, {{ calculation[:-3] }} AS {{ result_name }}
        FROM {{ rel }}
    {% endset %}

    {% set result = get_result_query(block_columns, query) %}

    {% if execute %}
        {{ log(result, info=True) }}
        {% do return(result) %}
    {% endif %}
{% endmacro %}