import os
from pathlib import Path
import subprocess

import oyaml as yaml


def create_empty_dbt_project(data_source_id: str, warehouse: str, target_dir: str):
    Path(target_dir).mkdir(parents=True, exist_ok=True)
    subprocess.call(
        f"dbt-init --client {data_source_id} --warehouse {warehouse} --target_dir {target_dir} --project_name "
        f"'kuwala' --project_directory {data_source_id} --profile_name 'kuwala'",
        shell=True,
    )

    profiles_file_path = f"{target_dir}/{data_source_id}/sample.profiles.yml"
    project_file_path = f"{target_dir}/{data_source_id}/dbt_project.yml"
    packages_file_path = f"{target_dir}/{data_source_id}/packages.yml"

    os.rename(profiles_file_path, profiles_file_path.replace("sample.", ""))

    # Update dbt_project.yml to the latest version
    with open(project_file_path, "r") as file:
        project_yaml = yaml.safe_load(file)

        file.close()

    project_yaml["config-version"] = 2
    project_yaml["model-paths"] = project_yaml.pop("source-paths")
    project_yaml["seed-paths"] = project_yaml.pop("data-paths")

    with open(project_file_path, "w") as file:
        yaml.safe_dump(project_yaml, file, indent=4)
        file.close()

    # Update dbt packages
    with open(packages_file_path, "r") as file:
        packages_yaml = yaml.safe_load(file)

        file.close()

    packages_yaml["packages"] = [dict(package="dbt-labs/codegen", version="0.5.0")]

    with open(packages_file_path, "w") as file:
        yaml.safe_dump(packages_yaml, file, indent=4)
        file.close()

    subprocess.call("dbt deps", cwd=f"{target_dir}/{data_source_id}", shell=True)
