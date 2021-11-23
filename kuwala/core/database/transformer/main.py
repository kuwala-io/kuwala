import argparse
import os
import subprocess
from sshtunnel import SSHTunnelForwarder


if __name__ == '__main__':
    ssh_host = os.getenv('SSH_HOST')
    ssh_user = os.getenv('SSH_USER')
    ssh_pkey = os.getenv('SSH_PKEY')
    dbt_host = os.getenv('DBT_HOST') or 'localhost'
    parser = argparse.ArgumentParser()

    parser.add_argument('--model', help='DBT model to run')

    args = parser.parse_args()

    os.chdir('transformer_dbt/')

    if ssh_host and ssh_user and ssh_pkey:
        ssh_tunnel = SSHTunnelForwarder(ssh_host, ssh_username=ssh_user, ssh_pkey=ssh_pkey,
                                        remote_bind_address=('127.0.0.1', 5432))

        ssh_tunnel.start()
        subprocess.call(f'dbt run --profiles-dir .{f" --select {args.model}" if args.model else ""}', shell=True,
                        env=dict(os.environ, DBT_PORT=str(ssh_tunnel.local_bind_port), DBT_HOST=dbt_host))
    else:
        subprocess.call(f'dbt run --profiles-dir .{f" --select {args.model}" if args.model else ""}', shell=True,
                        env=dict(os.environ, DBT_HOST=dbt_host))
