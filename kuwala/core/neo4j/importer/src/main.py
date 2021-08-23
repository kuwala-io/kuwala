import argparse
import PipelineImporter as PipelineImporter

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--continent', help='Continent of the file')
    parser.add_argument('--country', help='Country of the file')
    parser.add_argument('--country_region', help='Country region of the file')
    args = parser.parse_args()

    PipelineImporter.start(args)
