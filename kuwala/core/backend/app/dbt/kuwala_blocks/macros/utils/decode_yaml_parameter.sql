{% macro decode_yaml_parameter(string) %}
    {% if execute %}
        {% do return(
            string |
            replace("YAML_STRING_SPACE", " ") |
            replace("YAML_STRING_ROUND_BRACKET_OPEN", "(") |
            replace("YAML_STRING_ROUND_BRACKET_CLOSED", ")") |
            replace("YAML_STRING_STAR", "*")
        ) %}
    {% endif %}
{% endmacro %}