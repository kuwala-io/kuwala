"""
reset
docker stop $(docker ps -a -q)
docker-compose down
docker-compose rm -f
"""

import os
import run_command as rc

rc.run_command(['reset'])
rc.run_command(['docker stop $(docker ps -a -q)'])
rc.run_command(['docker-compose down'])
rc.run_command(['docker-compose rm -f'])