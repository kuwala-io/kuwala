import asyncio

from quart import jsonify


def execute_futures(items, execute, parse):
    loop = asyncio.get_event_loop()
    futures = []

    for item in items:
        futures.append(loop.run_in_executor(None, execute, item))

    results = loop.run_until_complete(asyncio.gather(*futures))
    parsed = []

    for result in results:
        parsed.append(parse(result))

    return jsonify({"success": True, "data": parsed})
