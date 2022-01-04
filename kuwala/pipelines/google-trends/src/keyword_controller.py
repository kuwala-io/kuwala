import logging
import os
import pycountry
from fuzzywuzzy import fuzz
from pyspark.sql.functions import col, concat_ws, lit


def get_keyword_by_region(sp, continent, country, country_region, keyword):
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(
        script_dir,
        f'../../../tmp/kuwala/admin_boundary_files/{continent}/{country}'
        f'{f"/{country_region}" if country_region else ""}/admin_boundaries.parquet'
    )

    if not os.path.exists(file_path):
        logging.error('No admin boundaries have been processed. Please run the admin-boundaries pipeline first.')

        return None

    admin_boundaries = sp.read.parquet(file_path) \
        .filter(col('parent').isNotNull()) \
        .select('name', 'id', 'kuwala_admin_level')
    country_alpha_2 = pycountry.countries.get(alpha_3=country).alpha_2
    subdivisions = list(pycountry.subdivisions.get(country_code=country_alpha_2))
    keywords = admin_boundaries.withColumn('keyword', concat_ws(' ', lit(keyword), col('name')))

    if country_region:
        geo = list(map(lambda s: dict(confidence=fuzz.token_set_ratio(country_region, s.name), id=s.code),
                       subdivisions))
        geo = list(sorted(geo, key=lambda g: g['confidence'], reverse=True))[0]['id']

        keywords = keywords.withColumn('geo', lit(geo))
    else:
        keywords = keywords.withColumn('geo', lit(country_alpha_2))

    return keywords.select('id', 'keyword', 'geo').toPandas()
