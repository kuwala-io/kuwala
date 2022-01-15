import os
from src.controller.kuwala_dbt_controller import KuwalaDbtController

if __name__ == '__main__':
    dbt_host = os.getenv('DBT_HOST') or 'localhost'
    script_dir = os.path.dirname(__file__)
    result_path = os.path.join(script_dir, '../../../tmp/kuwala/transformer')
    kuwala_dbt_controller = KuwalaDbtController(dbt_path='./dbt', dbt_host=dbt_host, result_path=result_path)

    kuwala_dbt_controller.run_all_models()
