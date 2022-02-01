from torpy.http.requests import TorRequests, tor_requests_session

def test_tor_network():
    with TorRequests() as tor_requests:
        with tor_requests.get_session() as sess:
            print("Circuit built.")
            torobj = sess.adapters.popitem()[1]
            router = torobj._tor_info._guard._router
            print(f'Relay Address: {router._ip}\n')
            return

def get_relay_address(relay_sesssion):
    torobj = relay_sesssion.adapters.popitem()[1]
    router = torobj._tor_info._guard._router
    return router.ip