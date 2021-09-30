import logging
import sys
import webbrowser
from InputController import select_demo, select_demographic_groups, select_pipelines, select_region
from PipelineOrchestrator import download_demo, run_command, run_pipelines


def launch_jupyter_notebook():
    run_command('docker-compose --profile core up', exit_keyword='Started.')

    jupyter_notebook = run_command('docker-compose run --service-ports jupyter', exit_keyword='running at')

    webbrowser.open('http://localhost:8888/lab/tree/kuwala/notebooks/popularity_correlation.ipynb')
    jupyter_notebook.terminate()
    input('Press <Enter> to stop all containers')
    run_command('docker stop $(docker ps -a -q)')
    run_command('docker-compose down')
    run_command('docker-compose rm -f')


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
