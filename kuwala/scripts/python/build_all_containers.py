"""
build_all_containers.sh:
cd ..
docker-compose build postgres database-importer database-transformer jupyter admin-boundaries google-poi-api google-poi-pipeline google-trends osm-parquetizer osm-poi population-density'
"""

import os
import run_command as rc

script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(os.path.join(script_dir,'../../'))

rc.run_command(['docker-compose build postgres database-importer database-transformer jupyter admin-boundaries google-poi-api google-poi-pipeline google-trends osm-parquetizer osm-poi population-density'])
    