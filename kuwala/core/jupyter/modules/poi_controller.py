# Get the aggregated number of a specific POI category per H3 index at a given resolution
def get_pois_by_category_in_polygon(dbt_controller, category, resolution, polygon_coords):
    return dbt_controller.run_macro(macro_category='poi', macro_name='get_pois_in_polygon',
                                    args='{' + f'h3_resolution: {str(resolution)}, category: {category}, '
                                               f'polygon_coords: \'{polygon_coords}\'' + '}')


# Get the total average popularity for H3 indexes at a given resolution
def get_popularity_in_polygon(dbt_controller, resolution, polygon_coords):
    return dbt_controller.run_macro(macro_category='poi', macro_name='get_popularity_in_polygon',
                                    args='{' + f'h3_resolution: {resolution}, polygon_coords: \'{polygon_coords}\'' +
                                         '}')
