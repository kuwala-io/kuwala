cd ../..
pip3 install virtualenv
virtualenv -p python3 venv
source ./venv/bin/activate
pip install -r kuwala/core/cli/requirements.txt
pip install -e .