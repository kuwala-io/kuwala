"""
build_cli.sh:

cd ../..
pip3 install virtualenv
virtualenv -p python3 venv
source ./venv/bin/activate
pip install -r kuwala/core/cli/requirements.txt
pip install -e .
"""

import os
import run_command as rc

script_dir = os.path.dirname(os.path.abspath(__file__))

os.chdir(os.path.join(script_dir,'../..'))
rc.run_command(['pip3 install virtualenv'])
rc.run_command(['virtualenv -p python3 venv'])
rc.run_command(['source ./venv/bin/activate'])
rc.run_command(['pip install -r kuwala/core/cli/requirements.txt'])
rc.run_command(['pip install -e .'])