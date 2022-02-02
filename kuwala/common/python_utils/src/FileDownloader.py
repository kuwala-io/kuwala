from pathlib import Path

import requests
from tqdm import tqdm


def download_file(url, path):
    response = requests.get(url, stream=True)
    total_size_in_bytes = int(response.headers.get("content-length", 0))
    block_size = 1024
    progress_bar = tqdm(total=total_size_in_bytes, unit="iB", unit_scale=True)

    Path(path.split(path.split("/").pop())[0]).mkdir(parents=True, exist_ok=True)

    with open(path, "wb") as file:
        for data in response.iter_content(block_size):
            progress_bar.update(len(data))
            file.write(data)

    progress_bar.close()
