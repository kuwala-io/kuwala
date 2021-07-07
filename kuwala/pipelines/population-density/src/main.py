import rasterio
import concurrent.futures


def process_geotiff():
    raster = rasterio.open('../tmp/cog_globallat_-10_lon_-90_general-v1.5.1.tif')
    transform = raster.transform
    windows = [window for ij, window in raster.block_windows()]
    population_df = []

    def process_pixels(pixels):
        population = []

        for x in range(pixels.shape[0]):
            for y in range(pixels.shape[1]):
                if pixels[x, y] > 0:
                    coords = (x, y) * transform

                    population.append({'lat': coords[1], 'lng': coords[0], 'value': pixels[x, y]})

        return population

    def process_window(window):
        pixels = raster.read(1, window=window)
        result = process_pixels(pixels)

        if len(result) > 0:
            population_df.append(result)

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        executor.map(process_window, windows)


if __name__ == '__main__':
    process_geotiff()
