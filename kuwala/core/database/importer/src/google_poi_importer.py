import logging
import os
import time

from pyspark.sql.functions import col, explode, lit, regexp_replace
from pyspark.sql.types import TimestampType


def import_google_pois(
    spark, database_url, database_properties, continent, country, country_region
):
    start_time = time.time()

    logging.info(
        f'Starting import of Google POIs for {f"{country_region}, " if country_region else ""}'
        f"{country}, {continent}"
    )

    script_dir = os.path.dirname(__file__)
    poi_data_dir = os.path.join(
        script_dir,
        f"../../../../tmp/kuwala/google_files/{continent}/{country}"
        f'{f"/{country_region}" if country_region else ""}/poi_data',
    )

    if not os.path.exists(poi_data_dir):
        logging.warning("No Google data available. Skipping import.")
        return

    osm_based_file_path = os.path.join(
        poi_data_dir,
        sorted(
            filter(lambda f: "osm" in f and "matched" in f, os.listdir(poi_data_dir)),
            reverse=True,
        )[0],
    )
    data = (
        spark.read.parquet(osm_based_file_path)
        .dropDuplicates(["internal_id"])
        .drop("osm_id", "osm_type", "confidence")
        .withColumn("kuwala_import_country", lit(country))
    )
    custom_files = sorted(
        filter(lambda f: "custom" in f and "matched" in f, os.listdir(poi_data_dir)),
        reverse=True,
    )

    if len(custom_files):
        custom_based_file_path = os.path.join(poi_data_dir, custom_files[0])
        custom_based_data = (
            spark.read.parquet(custom_based_file_path)
            .dropDuplicates(["internal_id"])
            .drop("id", "confidence")
            .withColumn("kuwala_import_country", lit(country))
        )
        data = data.union(custom_based_data).dropDuplicates(["internal_id"])

    poi_data = (
        data.withColumn("has_popularity", col("popularity").isNotNull())
        .withColumn("has_opening_hours", col("opening_hours").isNotNull())
        .withColumn("has_waiting_time", col("waiting_time").isNotNull())
        .drop("opening_hours", "popularity", "waiting_time")
    )
    popularity_data = (
        data.select("internal_id", "popularity")
        .withColumn("popularity", explode("popularity"))
        .select(
            "internal_id",
            col("popularity.popularity").alias("popularity"),
            col("popularity.timestamp").alias("timestamp"),
        )
        .withColumn("timestamp", regexp_replace("timestamp", "\\.", ":"))
    )
    opening_hours_data = (
        data.select("internal_id", "opening_hours")
        .withColumn("opening_hours", explode("opening_hours"))
        .select(
            "internal_id",
            col("opening_hours.date").alias("date"),
            col("opening_hours.opening_time").alias("opening_time"),
            col("opening_hours.closing_time").alias("closing_time"),
        )
        .withColumn("date", regexp_replace("date", "\\.", ":"))
        .withColumn(
            "opening_time",
            regexp_replace("opening_time", "\\.", ":").cast(TimestampType()),
        )
        .withColumn(
            "closing_time",
            regexp_replace("closing_time", "\\.", ":").cast(TimestampType()),
        )
    )
    waiting_time_data = (
        data.select("internal_id", "waiting_time")
        .withColumn("waiting_time", explode("waiting_time"))
        .select(
            "internal_id",
            col("waiting_time.waiting_time").alias("waiting_time"),
            col("waiting_time.timestamp").alias("timestamp"),
        )
        .withColumn("timestamp", regexp_replace("timestamp", "\\.", ":"))
    )

    logging.info("Importing POIs")
    poi_data.write.option("truncate", True).option("cascadeTruncate", True).jdbc(
        url=database_url,
        table="google_poi",
        mode="overwrite",
        properties=database_properties,
    )
    logging.info("Importing popularities")
    popularity_data.write.option("truncate", True).jdbc(
        url=database_url,
        table="google_poi_popularity",
        mode="overwrite",
        properties=database_properties,
    )
    logging.info("Importing opening hours")
    opening_hours_data.write.option("truncate", True).jdbc(
        url=database_url,
        table="google_poi_opening_hours",
        mode="overwrite",
        properties=database_properties,
    )
    logging.info("Importing waiting times")
    waiting_time_data.write.option("truncate", True).jdbc(
        url=database_url,
        table="google_poi_waiting_time",
        mode="overwrite",
        properties=database_properties,
    )
    logging.info(
        f'Successfully imported Google POIs for {f"{country_region}, " if country_region else ""}{country}, '
        f"{continent} after {round(time.time() - start_time)} s"
    )
