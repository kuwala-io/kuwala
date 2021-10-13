import moment
import pandas
from pytrends.request import TrendReq


def get_monthly_trend_for_keywords(file_path, delimiter=';', year_start=moment.utcnow().subtract(years=5).year):
    pytrends = TrendReq(hl='en-US', tz=0)
    timeframe = f'{year_start}-01-01 {str(moment.utcnow().date).split(" ")[0]}'
    kw_file = pandas.read_csv(file_path, delimiter=delimiter)
    kw_list = kw_file['keyword'].to_list()
    kw_ids = kw_file['id'].to_list()
    results = None

    for index, kw in enumerate(kw_list):
        pytrends.build_payload([kw], geo='DE', timeframe=timeframe)
        result = pytrends.interest_over_time()
        results = pandas.concat([results, result[kw]], axis=1) if index > 0 else result[kw]

    results.columns = kw_ids
    blub = ''
