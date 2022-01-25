"""
build_jupyter_notebook.sh:
cd ..
docker-compose build jupyter

"""

import os
import run_command as rc

script_dir = os.path.dirname(os.path.abspath(__file__))

os.chdir(os.path.join(script_dir,'../../'))
rc.run_command(['docker-compose build jupyter'])