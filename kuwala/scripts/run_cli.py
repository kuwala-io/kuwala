"""
cd ../../
source ./venv/bin/activate
cd kuwala/core/cli
python3 src/main.py
"""

import os
import run_command as rc

script_dir = os.path.dirname(os.path.abspath(__file__))

os.chdir(os.path.join(script_dir,'../../'))
rc.run_command(['source ./venv/bin/activate'])
os.chdir(os.path.join(script_dir,'../../','kuwala/core/cli'))
rc.run_command(['python3 src/main.py'])
