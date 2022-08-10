import os
import re
import zipfile

from pyspark.sql.functions import split
from pyspark.sql.types import DateType, DoubleType, IntegerType, StringType, StructType
from python_utils.src.FileDownloader import download_file
from python_utils.src.file_converter import txt_to_csv


def download_geonames_file(dump_name, file_path):
    download_file(
        url=f"https://download.geonames.org/export/dump/{dump_name}.zip", path=file_path
    )

    with zipfile.ZipFile(file_path, "r") as zip_ref:
        zip_ref.extractall(file_path.split(f"/{dump_name}.zip")[0])

    os.remove(file_path)


def get_schema():
    return (
        StructType()
        .add("geoname_id", IntegerType())
        .add("name", StringType())
        .add("ascii_name", StringType())
        .add("alternate_names", StringType())
        .add("latitude", DoubleType())
        .add("longitude", DoubleType())
        .add("feature_class", StringType())
        .add("feature_code", StringType())
        .add("country_code", StringType())
        .add("alternate_country_codes", StringType())
        .add("admin_1_code", StringType())
        .add("admin_2_code", StringType())
        .add("admin_3_code", StringType())
        .add("admin_4_code", StringType())
        .add("population", IntegerType())
        .add("elevation", IntegerType())
        .add("digital_elevation_model", IntegerType())
        .add("timezone", StringType())
        .add("modification_date", DateType())
    )


def get_geonames_cities(sp):
    dump_name = "cities500"
    script_dir = os.path.dirname(__file__)
    file_path_zip = os.path.join(
        script_dir, f"../../../tmp/kuwala/admin_boundary_files/{dump_name}.zip"
    )
    file_path_txt = file_path_zip.replace(".zip", ".txt")
    file_path_csv = file_path_zip.replace(".zip", ".csv")
    r = re.compile("([a-zA-Z]+)([0-9]+)")
    m = r.match(dump_name)
    file_path_parquet = file_path_zip.replace(
        f"{dump_name}.zip", f"{m.group(1)}_{m.group(2)}.parquet"
    )

    download_geonames_file(dump_name=dump_name, file_path=file_path_zip)
    txt_to_csv(file_path=file_path_txt)

    df = sp.read.csv(file_path_csv, schema=get_schema())
    df = df.withColumn("alternate_names", split("alternate_names", ",")).withColumn(
        "alternate_country_codes", split("alternate_country_codes", ",")
    )

    df.write.mode("overwrite").parquet(file_path_parquet)
    os.remove(file_path_txt)
    os.remove(file_path_csv)
