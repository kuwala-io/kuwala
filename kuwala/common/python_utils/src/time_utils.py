import time
from time import sleep


def print_elapsed_time(exit_event):
    start_time = time.time()

    while True:
        if exit_event.is_set():
            break

        print(f'Running for {round(time.time() - start_time)} s', end='\r')
        sleep(1)
