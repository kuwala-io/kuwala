{% macro filter_by_regex(dbt_model, column, regex) %}
    {% set rel = '{{ ref("' + dbt_model + '") }}' %}

    {% set query %}
        -- KUWALA_TRANSFORMATION_START
        SELECT *
        FROM {{ rel }}
        {% if target.type == 'bigquery' %}
            WHERE REGEXP_CONTAINS({{ column }}, '{{ regex }}')
        {% else %}
            WHERE {{ column }} ~ '{{ regex }}'
        {% endif %}
        -- KUWALA_TRANSFORMATION_END
    {% endset %}

    {% if execute %}
        {{ log(query, info=True) }}
        {% do return(query) %}
    {% endif %}
{% endmacro %}