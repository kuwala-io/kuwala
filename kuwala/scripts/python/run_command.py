from threading import Thread
import subprocess
import os

def run_command(command: [str], exit_keyword=None):
    process = subprocess.Popen(
        command,
        bufsize=1,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
        shell=True
    )
    thread_result = dict(hit_exit_keyword=False)

    def print_std(std, result):
        while True:
            line = std.readline()

            if len(line.strip()) > 0:
                print(line if 'Stage' not in line and '%' not in line else line.strip(), end='\r')

            if exit_keyword is not None and exit_keyword in line:
                result['hit_exit_keyword'] = True

                break

            return_code = process.poll()

            if return_code is not None:
                if return_code != 0:
                    return RuntimeError()

                break

    stdout_thread = Thread(target=print_std, args=(process.stdout, thread_result,), daemon=True)
    stderr_thread = Thread(target=print_std, args=(process.stderr, thread_result,), daemon=True)

    stdout_thread.start()
    stderr_thread.start()

    while stdout_thread.is_alive() and stderr_thread.is_alive():
        pass

    if thread_result['hit_exit_keyword']:
        return process



if __name__=='__main__':
    run_command()