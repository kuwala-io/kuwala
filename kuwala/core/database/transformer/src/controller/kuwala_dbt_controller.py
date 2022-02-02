import os
import subprocess

import pandas as pd
from sshtunnel import SSHTunnelForwarder


class KuwalaDbtController:
    def __init__(self, dbt_path: str, dbt_host: str, result_path: str):
        self.dbt_path = dbt_path
        self.dbt_host = dbt_host
        self.result_path = result_path

        os.chdir(self.dbt_path)

        ssh_host = os.getenv("SSH_HOST")
        ssh_user = os.getenv("SSH_USER")
        ssh_pkey = os.getenv("SSH_PKEY")
        dbt_host = os.getenv("DBT_HOST") or "localhost"

        if ssh_host and ssh_user and ssh_pkey:
            self.ssh_tunnel = SSHTunnelForwarder(
                ssh_host,
                ssh_username=ssh_user,
                ssh_pkey=ssh_pkey,
                remote_bind_address=("127.0.0.1", 5432),
            )

            self.ssh_tunnel.start()
            self.shell_environment = dict(
                os.environ,
                DBT_PORT=str(self.ssh_tunnel.local_bind_port),
                DBT_HOST=dbt_host,
            )
        else:
            self.shell_environment = dict(os.environ, DBT_HOST=dbt_host)

    def read_macro_result(self, macro_category: str, macro_name: str):
        macro_path = f"{self.result_path}/macros/{macro_category}/{macro_name}"
        result_file_name = sorted(os.listdir(macro_path), reverse=True)[0]

        return pd.read_csv(f"{macro_path}/{result_file_name}")

    def run_macro(
        self, macro_category: str, macro_name: str, args: str, return_df=True
    ):
        if not self.dbt_path:
            return Exception("Kuwala dbt controller is not initialized")

        args = args[:1] + f"result_path: {self.result_path}, " + args[1:]
        command = (
            f"dbt run-operation {macro_name}"
            + (f' --args "{args}"' if args else "")
            + " --profiles-dir ."
        )

        subprocess.call(command, shell=True, env=self.shell_environment)

        if return_df:
            return self.read_macro_result(
                macro_category=macro_category, macro_name=macro_name
            )

    def run_all_models(self):
        if not self.dbt_path:
            return Exception("Kuwala dbt controller is not initialized")

        subprocess.call(
            "dbt run --profiles-dir .", shell=True, env=self.shell_environment
        )
