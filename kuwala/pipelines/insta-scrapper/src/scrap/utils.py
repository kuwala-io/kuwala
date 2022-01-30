def get_relay_address(relay_sesssion):
    torobj = relay_sesssion.adapters.popitem()[1]
    # print(torobj.__dict__)
    router = torobj._tor_info._guard._router
    # print(f'Relay Address: {router._ip}\n')
    return router.ip