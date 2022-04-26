from glob import glob


def get_dbt_model_dir(dbt_dir: str, dbt_model_name: str) -> str:
    matches = glob(f"{dbt_dir}/models/marts/*/*/{dbt_model_name}.sql")

    return matches[0].split(dbt_model_name)[0]
