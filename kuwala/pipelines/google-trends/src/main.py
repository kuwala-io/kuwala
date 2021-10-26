import argparse
import os
from keyword_controller import get_keyword_by_region
from pathlib import Path
from pyspark.sql import SparkSession
from trends_controller import get_monthly_trend_for_keywords


if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument('--continent', help='Continent of the file')
    parser.add_argument('--country', help='Country of the file')
    parser.add_argument('--country_region', help='Country of the file')
    parser.add_argument('--keyword', help='Keyword the data should be retrieved for')

    args = parser.parse_args()
    continent = args.continent
    country = args.country
    country_region = args.country_region
    keyword = args.keyword
    memory = os.getenv('SPARK_MEMORY') or '16g'
    spark = SparkSession.builder \
        .appName('google-trends') \
        .config('spark.driver.memory', memory) \
        .getOrCreate() \
        .newSession()

    keywords = get_keyword_by_region(
        sp=spark, continent=continent, country=country, country_region=country_region, keyword=keyword)
    results = get_monthly_trend_for_keywords(keywords)

    script_dir = os.path.dirname(__file__)
    result_dir = os.path.join(
        script_dir,
        f'../tmp/{continent}/{country}/{f"{country_region}/" if country_region else ""}{keyword.lower()}')
    result_path = result_dir + '/results.csv'

    Path(result_dir).mkdir(parents=True, exist_ok=True)
    results.to_csv(result_path, sep=';', index=False)
