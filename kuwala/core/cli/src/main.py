import logging

from InputController import select_demographic_groups, select_pipelines, select_region
from PipelineOrchestrator import run_pipelines

if __name__ == '__main__':
    logging.basicConfig(
        format='%(levelname)s %(asctime)s: %(message)s',
        level=logging.INFO,
        datefmt='%m/%d/%Y %I:%M:%S %p'
    )
    logging.info(f'Kuwala CLI is ready to rumble')

    pipelines = select_pipelines()
    continent, country, country_region, population_density_id = select_region(pipelines)
    demographic_groups = select_demographic_groups(population_density_id) if population_density_id is not None else None

    logging.info(f'Starting {str(", ").join(pipelines)} {"pipelines" if len(pipelines) > 1 else "pipeline"}')

    run_pipelines(pipelines, continent, country, country_region, demographic_groups)
