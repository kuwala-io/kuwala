import sys

sys.path.insert(0, './src')

import src.neo4j.PipelineImporter as PipelineImporter

if __name__ == '__main__':
    PipelineImporter.import_pipelines()
    PipelineImporter.connect_pipelines()
