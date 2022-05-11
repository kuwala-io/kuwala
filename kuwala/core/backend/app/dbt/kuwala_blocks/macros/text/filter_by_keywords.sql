{% macro filter_by_keywords(dbt_model, block_columns, column, keywords) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {%- set parsed_keywords -%}
        {% for keyword in keywords %}'{{ decode_yaml_parameter(keyword) }}',{% endfor %}
    {%- endset -%}

    {% set query %}
        SELECT *
        FROM {{ rel }}
        WHERE {{ column }} IN ({{ parsed_keywords[:-1] }})
    {% endset %}

    {% set result = get_result_query(block_columns, query) %}

    {% if execute %}
        {{ log(result, info=True) }}
        {% do return(result) %}
    {% endif %}
{% endmacro %}