{% macro filter_by_keywords(dbt_model, column, keywords) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {%- set parsed_keywords -%}
        {% for keyword in keywords %}'{{ decode_yaml_parameter(keyword) }}',{% endfor %}
    {%- endset -%}

    {% set query %}
        -- KUWALA TRANSFORMATION
        SELECT *
        FROM {{ rel }}
        WHERE {{ column }} IN ({{ parsed_keywords[:-1] }})
    {% endset %}

    {% if execute %}
        {{ log(query, info=True) }}
        {% do return(query) %}
    {% endif %}
{% endmacro %}