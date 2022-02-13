import argparse
import os

from admin_boundaries_controller import get_admin_boundaries
from pyspark.sql import SparkSession

if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument("--continent", help="Continent of the file")
    parser.add_argument("--country", help="Country of the file")
    parser.add_argument("--country_region", help="Country of the file")

    args = parser.parse_args()
    continent = args.continent
    country = args.country
    country_region = args.country_region
    memory = os.getenv("SPARK_MEMORY") or "16g"
    spark = (
        SparkSession.builder.appName("admin-boundaries")
        .config("spark.driver.memory", memory)
        .getOrCreate()
        .newSession()
    )

    get_admin_boundaries(
        sp=spark, continent=continent, country=country, country_region=country_region
    )
