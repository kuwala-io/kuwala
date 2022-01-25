"""
cd ../..
git archive --format=zip HEAD -o kuwala.zip
"""

import os
import run_command as rc

script_dir = os.path.dirname(os.path.abspath(__file__))

os.chdir(os.path.join(script_dir,'../../../'))
rc.run_command(['git archive --format=zip HEAD -o kuwala.zip'])