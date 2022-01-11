# Get the aggregated total population per H3 index at a given resolution
def get_population_in_h3(dbt_controller, resolution, polygon_coords):
    return dbt_controller.run_macro(macro_category='population_density', macro_name='get_population_in_polygon',
                                    args='{' + f'h3_resolution: {str(resolution)}' + '}')
