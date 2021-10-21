import moment
import os
import pandas
from pytrends.request import TrendReq


def get_monthly_trend_for_keywords(key_words, year_start=moment.utcnow().subtract(years=5).year):
    proxy = os.environ.get('PROXY_ADDRESS')
    pytrends = TrendReq(hl='en-US', tz=0, proxies=[proxy], retries=3, backoff_factor=1)
    timeframe = f'{year_start}-01-01 {str(moment.utcnow().date).split(" ")[0]}'
    kw_list = key_words['keyword'].to_list()
    results = None

    for index, kw in enumerate(kw_list):
        pytrends.build_payload([kw], geo=key_words['geo'][index], timeframe=timeframe)
        result = pytrends.interest_over_time()

        if not result.empty:
            results = pandas.concat([results, result[kw]], axis=1) if index > 0 else result[kw]
        else:
            print('Noob')

    results.columns = key_words['id'].to_list()
    blub = ''
