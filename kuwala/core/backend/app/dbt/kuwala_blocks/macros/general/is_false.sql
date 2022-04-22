{% macro is_false(dbt_model, column) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {% set query %}
        -- KUWALA_TRANSFORMATION_START
        SELECT *
        FROM {{ rel }}
        WHERE {{ column }} = False
        -- KUWALA_TRANSFORMATION_END
    {% endset %}

    {% if execute %}
        {{ log(query, info=True) }}
        {% do return(query) %}
    {% endif %}
{% endmacro %}