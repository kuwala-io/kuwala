{%- macro try_cast(str, datatype) -%}

{%- if datatype == 'bigint' or datatype == 'int' -%}

    case
        when trim({{ str }}) ~ '^[0-9]+$' then trim({{ str }})
        else null
    end::{{ datatype }}

{%- else -%}

    {{ exceptions.raise_compiler_error("non-integer datatypes are not currently supported") }}

{%- endif -%}

{%- endmacro -%}