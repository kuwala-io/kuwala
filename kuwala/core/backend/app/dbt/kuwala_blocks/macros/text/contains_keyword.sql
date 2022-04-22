{% macro contains_keyword(dbt_model, column, keyword) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {% set query %}
        -- KUWALA_TRANSFORMATION_START
        SELECT *
        FROM {{ rel }}
        WHERE {{ column }} LIKE '%{{ decode_yaml_parameter(keyword) }}%'
        -- KUWALA_TRANSFORMATION_END
    {% endset %}

    {% if execute %}
        {{ log(query, info=True) }}
        {% do return(query) %}
    {% endif %}
{% endmacro %}