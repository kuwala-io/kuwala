"""
cd ..
docker-compose build postgres
"""

import os
import run_command as rc

script_dir = os.path.dirname(os.path.abspath(__file__))

os.chdir(os.path.join(script_dir,'../../'))
rc.run_command(['docker-compose build postgres'])