from func_timeout import func_timeout
from torpy.http.requests import TorRequests, tor_requests_session
import locations

def tor_requests():
    with TorRequests() as tor_requests:
        with tor_requests.get_session() as sess:
            print("Circuit built.") # connection works
            torobj = sess.adapters.popitem()[1]
            # print(torobj.__dict__)
            router = torobj._tor_info._guard._router
            print(f'Relay Address: {router._ip}\n')
            i = 0
            return

def main():
    i = 0
    while i < 5:
        try:
            print(f'\nIteration {i+1}')
            func_timeout(600, locations.scrape_location, args=([1313809508724705]))
            # tor_requests()
        except Exception as e:
            print("FUNCTION TIMED OUT")
            print(e)
        i = i+1

def test_main():
    is_written = False
    i = 0
    while not is_written:
        try:
            print(f'\n\nIteration {i+1}')
            is_written = func_timeout(600, locations.scrape_location, args=([1313809508724705]))
        except Exception as e:
            print("Something went wrong")
            print(e)
        i = i+1
    print("\n=== Process Completed! ===")
    

test_main()
