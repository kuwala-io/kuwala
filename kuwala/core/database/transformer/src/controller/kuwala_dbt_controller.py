import os
import pandas as pd
import subprocess


class KuwalaDbtController:
    def __init__(self, dbt_path: str, dbt_host: str, result_path: str):
        self.dbt_path = dbt_path
        self.dbt_host = dbt_host
        self.result_path = result_path

        os.chdir(self.dbt_path)

    def read_macro_result(self, macro_category: str, macro_name: str):
        macro_path = f'{self.result_path}/macros/{macro_category}/{macro_name}'
        result_file_name = sorted(os.listdir(macro_path), reverse=True)[0]

        return pd.read_csv(f'{macro_path}/{result_file_name}')

    def run_macro(self, macro_category: str, macro_name: str, args: str, return_df=True):
        if not self.dbt_path:
            return Exception('Kuwala dbt controller is not initialized')

        args = args[:1] + f'result_path: {self.result_path}, ' + args[1:]
        command = f'dbt run-operation {macro_name}' + (f' --args "{args}"' if args else '') + ' --profiles-dir .'
        subprocess.call(command, shell=True, env=dict(os.environ, DBT_HOST=self.dbt_host))

        if return_df:
            return self.read_macro_result(macro_category=macro_category, macro_name=macro_name)
