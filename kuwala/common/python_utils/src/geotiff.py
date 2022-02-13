import concurrent.futures

import rasterio


def process_geotiff(path: str):
    """This is an initial approach for processing single band GeoTIFFs"""

    raster = rasterio.open(path)
    transform = raster.transform
    windows = [window for ij, window in raster.block_windows()]
    data_df = []

    def process_pixels(pixels):
        data = []

        for x in range(pixels.shape[0]):
            for y in range(pixels.shape[1]):
                if pixels[x, y] > 0:
                    coords = (x, y) * transform

                    data.append(
                        {"lat": coords[1], "lng": coords[0], "value": pixels[x, y]}
                    )

        return data

    def process_window(window):
        pixels = raster.read(1, window=window)
        result = process_pixels(pixels)

        if len(result) > 0:
            data_df.append(result)

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        executor.map(process_window, windows)
