{% macro union(dbt_model_left, dbt_model_right) %}
    {% set rel_left = '{{ ref("' + dbt_model_left + '") }}' %}
    {% set rel_right = '{{ ref("' + dbt_model_right + '") }}' %}

    {% set query %}
        -- KUWALA_TRANSFORMATION_START
        SELECT * FROM {{ rel_left }}
        UNION
        SELECT * FROM {{ rel_right }}
        -- KUWALA_TRANSFORMATION_END
    {% endset %}

    {% if execute %}
        {{ log(query, info=True) }}
        {% do return(query) %}
    {% endif %}
{% endmacro %}