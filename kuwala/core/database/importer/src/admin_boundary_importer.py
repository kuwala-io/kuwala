import logging
import os
import time

from postgres_controller import send_query
from pyspark.sql.functions import lit


def import_osm_admin_boundaries(
    spark,
    database_host,
    database_port,
    database_name,
    database_url,
    database_properties,
    country,
    file_path,
):
    if not os.path.exists(file_path):
        logging.warning("No OSM admin boundaries file available. Skipping import.")
        return

    data = (
        spark.read.parquet(file_path)
        .withColumn("kuwala_import_country", lit(country))
        .coalesce(1)
        .sort("kuwala_admin_level")
    )

    data.write.option("truncate", True).option("batchsize", 1).jdbc(
        url=database_url,
        table="admin_boundary",
        mode="overwrite",
        properties=database_properties,
    )

    send_query(
        database_host=database_host,
        database_port=database_port,
        database_name=database_name,
        database_user=database_properties["user"],
        database_password=database_properties["password"],
        path_to_query_file="../sql/create_admin_boundary_geometries.sql",
    )


def import_geonames_cities(spark, database_url, database_properties, file_path):
    if not os.path.exists(file_path):
        logging.warning("No GeoNames city names available. Skipping import.")
        return

    data = spark.read.parquet(file_path)

    data.write.option("truncate", True).jdbc(
        url=database_url,
        table="admin_boundary_geonames_cities",
        mode="overwrite",
        properties=database_properties,
    )


def import_admin_boundaries(
    spark,
    database_host,
    database_port,
    database_name,
    database_url,
    database_properties,
    continent,
    country,
    country_region,
):
    start_time = time.time()

    logging.info(
        f"Starting import of admin boundaries for "
        f'{f"{country_region}, " if country_region else ""}{country}, {continent}'
    )

    script_dir = os.path.dirname(__file__)
    file_path_geonames_cities = os.path.join(
        script_dir, "../../../../tmp/kuwala/admin_boundary_files/cities_500.parquet"
    )
    file_path_osm_admin_boundaries = os.path.join(
        script_dir,
        f"../../../../tmp/kuwala/admin_boundary_files/{continent}/{country}"
        f'{f"/{country_region}" if country_region else ""}/admin_boundaries.parquet',
    )

    import_geonames_cities(
        spark=spark,
        database_url=database_url,
        database_properties=database_properties,
        file_path=file_path_geonames_cities,
    )
    import_osm_admin_boundaries(
        spark=spark,
        database_host=database_host,
        database_port=database_port,
        database_name=database_name,
        database_url=database_url,
        database_properties=database_properties,
        country=country,
        file_path=file_path_osm_admin_boundaries,
    )

    logging.info(
        f"Successfully imported admin boundaries for "
        f'{f"{country_region}, " if country_region else ""}{country}, {continent} after '
        f"{round(time.time() - start_time)} s"
    )
