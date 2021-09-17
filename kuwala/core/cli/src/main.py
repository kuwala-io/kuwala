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
    selected_region = select_region(pipelines)
    selected_region['demographic_groups'] = select_demographic_groups(pipelines, selected_region)

    logging.info('You can lean back now and wait for the pipelines to do their magic.')
    logging.info(f'Starting {str(", ").join(pipelines)} {"pipelines" if len(pipelines) > 1 else "pipeline"}')

    run_pipelines(pipelines, selected_region)
