import logging
import sys
import webbrowser
from InputController import select_demo, select_demographic_groups, select_pipelines, select_region
from PipelineOrchestrator import download_demo, run_command, run_pipelines


def launch_jupyter_notebook():
    run_command('docker-compose --profile database up', exit_keyword='database system is ready to accept connections')
    run_command('docker-compose run --service-ports jupyter', exit_keyword='or http')

    webbrowser.open('http://localhost:8888/lab/tree/kuwala/notebooks/popularity_correlation.ipynb')
    print('To stop and remove all Docker containers run the "python3 stop_all_containers.py"')


if __name__ == '__main__':
    logging.basicConfig(
        format='%(levelname)s %(asctime)s: %(message)s',
        level=logging.INFO,
        datefmt='%m/%d/%Y %I:%M:%S %p'
    )
    logging.info(f'Kuwala CLI is ready to rumble')

    demo = select_demo()

    if demo:
        download_demo()
    else:
        pipelines = select_pipelines()
        selected_region = select_region(pipelines)
        selected_region['demographic_groups'] = select_demographic_groups(pipelines, selected_region)

        logging.info('You can lean back now and wait for the pipelines to do their magic.')
        logging.info(f'Starting {str(", ").join(pipelines)} {"pipelines" if len(pipelines) > 1 else "pipeline"}')

        run_pipelines(pipelines, selected_region)

    launch_jupyter_notebook()
    sys.exit(0)
