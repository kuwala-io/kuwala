{% macro compare_with_number(dbt_model, column, comparator, comparison_value) %}
    {% set comparator_value = get_comparator_value(comparator) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {% set query %}
        -- KUWALA TRANSFORMATION
        SELECT *
        FROM {{ rel }}
        WHERE {{ column }} {{ comparator_value }} {{ comparison_value }}
    {% endset %}

    {% if execute %}
        {{ log(query, info=True) }}
        {% do return(query) %}
    {% endif %}
{% endmacro %}