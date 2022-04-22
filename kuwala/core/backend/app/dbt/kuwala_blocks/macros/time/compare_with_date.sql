{% macro compare_with_date(dbt_model, column, comparator, comparison_date) %}
    {% set comparator_value = get_comparator_value(comparator) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {% set query %}
        -- KUWALA_TRANSFORMATION_START
        SELECT *
        FROM {{ rel }}
        WHERE {{ column }} {{ comparator_value }} '{{ comparison_date }}'
        -- KUWALA_TRANSFORMATION_END
    {% endset %}

    {% if execute %}
        {{ log(query, info=True) }}
        {% do return(query) %}
    {% endif %}
{% endmacro %}