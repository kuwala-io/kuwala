import logging

from InputController import select_pipelines, select_region

if __name__ == '__main__':
    logging.basicConfig(
        format='%(levelname)s %(asctime)s: %(message)s',
        level=logging.INFO,
        datefmt='%m/%d/%Y %I:%M:%S %p'
    )

    pipelines = select_pipelines()
    continent, country, country_region = select_region(pipelines)
    logging.info(f'Starting {str(", ").join(pipelines)} {"pipelines" if len(pipelines) > 1 else "pipeline"}')
