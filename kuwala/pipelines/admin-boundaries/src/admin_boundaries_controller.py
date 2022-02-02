import json
import logging
import os

from pyspark.sql.functions import col, concat_ws, lit, udf
from pyspark.sql.types import IntegerType
from shapely.geometry import shape


def get_overlap_ratio(parent_id, child_shape, parent_shape):
    intersection = child_shape.intersection(parent_shape)
    intersection_area = intersection.area

    return dict(id=parent_id, overlap_ratio=intersection_area / parent_shape.area)


def build_hierarchy(admin_boundaries, admin_levels):
    for i1, r1 in admin_boundaries.iterrows():
        if r1.osm_admin_level != admin_levels[0]:
            child_geo_json = json.loads(r1.geo_json)
            child_shape = shape(child_geo_json)
            parent_candidates = []

            for i2, r2 in admin_boundaries[
                admin_boundaries.osm_admin_level < r1.osm_admin_level
            ].iterrows():
                parent_geo_json = json.loads(r2.geo_json)
                parent_shape = shape(parent_geo_json)

                if (
                    child_shape.is_valid
                    and parent_shape.is_valid
                    and child_shape.intersects(parent_shape)
                ):
                    candidate = [
                        dict(
                            id=r2.id, admin_level=r2.osm_admin_level, shape=parent_shape
                        )
                    ]

                    if not len(parent_candidates):
                        parent_candidates = candidate
                    elif parent_candidates[0]["admin_level"] == r2.osm_admin_level:
                        parent_candidates += candidate

            if not len(parent_candidates):
                continue
            elif len(parent_candidates) == 1:
                admin_boundaries.at[i1, "parent"] = parent_candidates[0]["id"]
            else:
                parent_candidates = list(
                    map(
                        lambda p: get_overlap_ratio(
                            parent_id=p["id"],
                            child_shape=child_shape,
                            parent_shape=p["shape"],
                        ),
                        parent_candidates,
                    )
                )
                admin_boundaries.at[i1, "parent"] = list(
                    sorted(
                        parent_candidates,
                        key=lambda p: p["overlap_ratio"],
                        reverse=True,
                    )
                )[0]["id"]

    for i1, r1 in admin_boundaries.iterrows():
        if r1["parent"]:
            parent_index = admin_boundaries.index[
                admin_boundaries["id"] == r1["parent"]
            ].tolist()

            if len(parent_index):
                parent_index = parent_index[0]
            else:
                continue

    return admin_boundaries


def get_admin_boundaries(sp, continent, country, country_region):
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(
        script_dir,
        f'../../../tmp/kuwala/osm_files/{continent}/{country}{f"/{country_region}" if country_region else ""}/parquet'
        "/kuwala.parquet",
    )

    if not os.path.exists(file_path):
        logging.error("No OSM data available for building admin boundaries")

        return None

    admin_boundaries = (
        sp.read.parquet(file_path)
        .withColumnRenamed("admin_level", "osm_admin_level")
        .select(
            "latitude",
            "longitude",
            "h3_index",
            "name",
            "boundary",
            "osm_admin_level",
            "geo_json",
        )
        .filter(
            col("boundary").isNotNull()
            & col("osm_admin_level").isNotNull()
            & col("name").isNotNull()
            & col("boundary").isin("administrative")
            & col("geo_json").contains("Polygon")
        )
        .drop("boundary")
    )

    osm_admin_levels = (
        admin_boundaries.select("osm_admin_level")
        .distinct()
        .sort("osm_admin_level")
        .toPandas()["osm_admin_level"]
        .tolist()
    )
    osm_admin_levels = sp.sparkContext.broadcast(osm_admin_levels)

    @udf(returnType=IntegerType())
    def get_kuwala_admin_level(admin_level):
        return osm_admin_levels.value.index(admin_level) + 1

    admin_boundaries = (
        admin_boundaries.withColumn(
            "kuwala_admin_level", get_kuwala_admin_level(col("osm_admin_level"))
        )
        .withColumn(
            "id",
            concat_ws(
                "_",
                lit(continent),
                lit(country),
                col("kuwala_admin_level"),
                col("h3_index"),
            ),
        )
        .sort(col("kuwala_admin_level").desc())
        .withColumn("parent", lit(None))
        .toPandas()
    )
    osm_admin_levels = osm_admin_levels.value
    admin_boundaries = build_hierarchy(admin_boundaries, osm_admin_levels)
    admin_boundaries = sp.createDataFrame(admin_boundaries)
    result_path = os.path.join(
        script_dir,
        f"../../../tmp/kuwala/admin_boundary_files/{continent}/{country}"
        f'{f"/{country_region}" if country_region else ""}/admin_boundaries.parquet',
    )

    admin_boundaries.write.mode("overwrite").parquet(result_path)
