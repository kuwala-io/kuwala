import os
import time


def get_result_dir(data_source_id: str, file_name: str) -> str:
    script_dir = os.path.dirname(__file__)
    data_source_result_dir = os.path.join(
        script_dir, f"../../../../../tmp/kuwala/backend/results/{data_source_id}"
    )
    is_exist = os.path.exists(data_source_result_dir)
    if not is_exist:
        os.makedirs(data_source_result_dir, exist_ok=True)
    file_name = f"{int(time.time())}_{file_name}"
    return f"{data_source_result_dir}/{file_name}"
