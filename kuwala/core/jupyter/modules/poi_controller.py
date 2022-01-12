# Get the aggregated number of a specific POI category per H3 index at a given resolution
def get_pois_by_category_in_h3(dbt_controller, category, resolution, polygon_coords):
    return dbt_controller.run_macro(macro_category='poi', macro_name='get_pois_in_polygon',
                                    args='{' + f'h3_resolution: {str(resolution)}, category: {category}, '
                                               f'polygon_coords: \'{polygon_coords}\'' + '}')
