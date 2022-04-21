{% macro is_false(dbt_model, column) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {% set query %}
        -- KUWALA TRANSFORMATION
        SELECT *
        FROM {{ rel }}
        WHERE {{ column }} = False
    {% endset %}

    {% if execute %}
        {{ log(query, info=True) }}
        {% do return(query) %}
    {% endif %}
{% endmacro %}