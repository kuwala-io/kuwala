"""
sh initialize_git_submodules.sh
sh build_neo4j.sh
sh build_cli.sh
sh build_jupyter_notebook.sh
sh build_all_containers.sh
"""

import os
import run_command as rc

script_dir = os.path.dirname(os.path.abspath(__file__))

rc.run_command(['python3 initialize_git_submodules.py'])
rc.run_command(['python3 build_neo4j.py'])
rc.run_command(['python3 build_cli.py'])
rc.run_command(['python3 build_jupyter_notebook.py'])
rc.run_command(['python3 build_all_containers.py'])
