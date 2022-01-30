import logging
import os
from time import sleep

import moment
import pandas
from pytrends.request import TrendReq


# noinspection PyBroadException
def get_monthly_trend_for_keywords(
    key_words, year_start=moment.utcnow().subtract(years=5).year
):
    max_retries = 7
    proxy = os.environ.get("PROXY_ADDRESS")
    pytrends = TrendReq(
        hl="en-US",
        tz=0,
        proxies=[proxy],
        retries=max_retries,
        backoff_factor=1,
        timeout=60,
    )
    timeframe = f'{year_start}-01-01 {str(moment.utcnow().date).split(" ")[0]}'
    kw_list = key_words["keyword"].to_list()
    results = pandas.DataFrame(columns=kw_list)

    for index, kw in enumerate(kw_list):
        attempt = 1
        sleep_time = 2
        got_response = False

        while not got_response and attempt <= max_retries:
            try:
                pytrends.build_payload(
                    [kw], geo=key_words["geo"][index], timeframe=timeframe
                )
                result = pytrends.interest_over_time()
                got_response = True
            except Exception:
                sleep(sleep_time)
                sleep_time *= 2

        if got_response and not result.empty:
            results[kw] = result[kw]
        elif not got_response:
            logging.warning(f"Could not get response for {kw}")

    results.columns = key_words["id"].to_list()

    return results
