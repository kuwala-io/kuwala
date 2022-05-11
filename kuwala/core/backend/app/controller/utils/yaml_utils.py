from controller.data_source.data_source import get_columns
import oyaml as yaml


def terminal_output_to_source_yaml(output) -> dict:
    yaml_string = output.stdout.decode("utf8").split("version: 2")[1]
    # Find last double quote to escape special characters at the end of the string that might be added by some IDEs
    last_double_quote_index = yaml_string.rfind('"')
    yaml_string = yaml_string[: last_double_quote_index + 1]

    return yaml.safe_load(f"version: 2{yaml_string}")


def terminal_output_to_base_model(
    output,
    data_source_id: str,
    schema_name: str,
    dataset_name: str,
    table_name: str,
    db,
) -> str:
    yaml_string = output.stdout.decode("utf8").split("with source")[1]
    columns = get_columns(
        data_source_id=data_source_id,
        schema_name=schema_name,
        dataset_name=dataset_name,
        table_name=table_name,
        db=db,
    )
    columns = list(
        map(
            lambda c: dict(original=c["column"], renamed=c["column"].lower()),
            columns,
        )
    )

    for i, column in enumerate(columns):
        if i < len(columns) - 1:
            yaml_string = yaml_string.replace(
                f" {column['renamed']},",
                f' source."{column["original"]}" AS {column["renamed"]},',
            )
        else:
            last_comma_index = yaml_string.rfind(",")
            yaml_string = yaml_string[:last_comma_index] + yaml_string[
                last_comma_index:
            ].replace(
                f" {column['renamed']}",
                f' source."{column["original"]}" AS {column["renamed"]} ',
            )

    # Find last "renamed" to escape special characters at the end of the string that might be added by some IDEs
    last_renamed_index = yaml_string.rfind("renamed")

    return f"with source{yaml_string[:last_renamed_index]}renamed"


def terminal_output_to_dbt_model(output) -> str:
    return (
        output.stdout.decode("utf8")
        .split("-- KUWALA_TRANSFORMATION_START")[1]
        .split("-- KUWALA_TRANSFORMATION_END")[0]
    )
