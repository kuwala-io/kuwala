import math
import os
from time import sleep
import urllib.error

from thefuzz import fuzz
from hdx.data.dataset import Dataset
from hdx.data.organization import Organization
from hdx.api.configuration import Configuration
import pycountry
import pycountry_convert as pcc
from pyquery import PyQuery
import questionary
import requests.exceptions

CONTINENTS = [
    {"code": "af", "name": "Africa", "geofabrik": "africa"},
    {"code": "an", "name": "Antarctica", "geofabrik": "antarctica"},
    {"code": "as", "name": "Asia", "geofabrik": "asia"},
    {"code": "na", "name": "Central America", "geofabrik": "central-america"},
    {"code": "eu", "name": "Europe", "geofabrik": "europe"},
    {"code": "na", "name": "North America", "geofabrik": "north-america"},
    {"code": "oc", "name": "Oceania", "geofabrik": "australia-oceania"},
    {"code": "sa", "name": "South America", "geofabrik": "south-america"},
]


def select_local_country(directory):
    continents = os.listdir(directory)
    continent_names = list(
        map(
            lambda c: pcc.convert_continent_code_to_continent_name(c.upper()),
            continents,
        )
    )
    continent = questionary.select(
        "Which continent are you interested in?", choices=continent_names
    ).ask()
    continent = continents[continent_names.index(continent)]
    continent_path = f"{directory}/{continent}"
    countries = os.listdir(continent_path)
    countries = list(filter(lambda c: not c.startswith("."), countries))
    country_names = list(
        map(
            lambda c: pcc.map_country_alpha3_to_country_name()[c.upper()] or c,
            countries,
        )
    )
    country = questionary.select(
        "Which country are you interested in?", choices=country_names
    ).ask()
    country = countries[country_names.index(country)]

    return f"{continent_path}/{country}"


def select_local_osm_file(directory):
    country_path = select_local_country(directory)

    if os.path.isdir(country_path + "/parquet/osm_parquetizer"):
        return country_path

    regions = os.listdir(country_path)
    region = questionary.select(
        "Which region are you interested in?", choices=regions
    ).ask()

    if region:
        return f"{country_path}/{region}"


def select_osm_file():
    base_url = "https://download.geofabrik.de"
    file_suffix = "-latest.osm.pbf"

    def pick_region(url: str):
        d = None
        sleep_time = 1
        max_sleep_time = math.pow(2, 4)

        while not d:
            try:
                d = PyQuery(url=url)
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    return dict(url=f"{url}{file_suffix}", all=True)
            except urllib.error.URLError:
                if sleep_time <= max_sleep_time:
                    sleep(sleep_time)

                    sleep_time *= 2
                else:
                    raise ConnectionRefusedError()
            except requests.exceptions.SSLError:
                if sleep_time <= max_sleep_time:
                    sleep(sleep_time)

                    sleep_time *= 2
                else:
                    raise ConnectionRefusedError()

        regions = d.find(f"a[href$='{file_suffix}']")
        regions = list(
            map(
                lambda rf: rf.text.split(file_suffix)[0],
                filter(lambda r: r.text, regions),
            )
        )

        regions.insert(0, "all")

        selected_region = questionary.select(
            "Which region are you interested in?", choices=regions
        ).ask()

        if selected_region == "all":
            return dict(url=f"{url}{file_suffix}", all=True)

        return dict(url=f"{url}/{selected_region}", all=False)

    continent_names = list(map((lambda c: c["name"]), CONTINENTS))
    continent = questionary.select(
        "Which continent are you interested in?", choices=continent_names
    ).ask()
    continent = CONTINENTS[continent_names.index(continent)]
    continent_geofabrik = continent["geofabrik"]
    continent = continent["code"]
    country = pick_region(f"{base_url}/{continent_geofabrik}")
    file = dict(url=None, continent=continent, country=None, country_region=None)

    if country:
        country_parts = country["url"].split(continent_geofabrik + "/")

        # Entire continent selected
        if len(country_parts) < 2:
            file["url"] = country["url"]

            return file

        region = pick_region(country["url"])

        try:
            file["country"] = pycountry.countries.search_fuzzy(country_parts[1])[
                0
            ].alpha_3.lower()
        except LookupError:
            countries = pycountry.countries.objects
            countries = list(
                map(
                    lambda c: dict(
                        code=c.alpha_3.lower(),
                        distance=fuzz.token_set_ratio(c.name.lower(), country_parts[1]),
                    ),
                    countries,
                )
            )
            country = max(countries, key=lambda c: c["distance"])

            if country["distance"] > 80:
                # TODO: Consider exceptions like 'malaysia-singapore-brunei'
                file["country"] = country["code"]
            else:
                file["country"] = country_parts[1]

        if region["all"]:
            file["url"] = region["url"]

            return file

        file["url"] = region["url"] + file_suffix
        file["country_region"] = region["url"].split(country_parts[1] + "/")[1].lower()

        return file

    return None


def get_countries_with_population_data(return_country_code=False):
    Configuration.create(hdx_site="prod", user_agent="Kuwala", hdx_read_only=True)
    # The identifier is for Facebook. This shouldn't change from HDX's side in the future since it's an id.
    datasets = Organization.read_from_hdx(
        identifier="74ad0574-923d-430b-8d52-ad80256c4461"
    ).get_datasets(query="Population")
    datasets = sorted(
        filter(
            lambda d: "population" in d["title"].lower() and "csv" in d["file_types"],
            map(
                lambda d: dict(
                    id=d.get("id"),
                    title=d.get("title"),
                    location=d.get_location_names(),
                    country_code=d.get_location_iso3s(),
                    file_types=d.get_filetypes(),
                    updated_date=d.get("last_modified")[:10],
                ),
                datasets,
            ),
        ),
        key=lambda d: d["location"][0],
    )
    countries = list(
        map(
            lambda d: d["location"][0]
            if not return_country_code
            else d["country_code"][0],
            datasets,
        )
    )

    return datasets, countries


def select_population_file(country_code=None):
    datasets, countries = get_countries_with_population_data()

    if not country_code:
        country = questionary.select(
            "For which country do you want to download the population data?",
            choices=countries,
        ).ask()
        dataset = datasets[countries.index(country)]
    else:
        dataset = next(
            (d for d in datasets if d["country_code"][0].lower() == country_code), None
        )

    country = dataset["country_code"][0].upper()
    country_alpha_2 = pcc.country_alpha3_to_country_alpha2(country)
    continent = pcc.country_alpha2_to_continent_code(country_alpha_2)
    dataset["country"] = country.lower()
    dataset["continent"] = continent.lower()

    del dataset["country_code"]

    return dataset


def select_demographic_groups(d: Dataset):
    resources = d.get_resources()

    def get_type(name: str):
        name = name.lower()

        if ("women" in name) and ("reproductive" not in name):
            return "women"

        if ("men" in name) and ("women" not in name):
            return "men"

        if "children" in name:
            return "children_under_five"

        if "youth" in name:
            return "youth_15_24"

        if "elderly" in name:
            return "elderly_60_plus"

        if "reproductive" in name:
            return "women_of_reproductive_age_15_49"

        return "total"

    resources = list(
        filter(
            lambda resource: resource["format"].lower() == "csv",
            map(
                lambda resource: dict(
                    id=resource.get("id"),
                    format=resource.get("format"),
                    type=get_type(resource.get("name")),
                    date=resource.get("last_modified")[:10],
                ),
                resources,
            ),
        )
    )
    resources = list(
        map(lambda r: dict(id=r["id"], type=r["type"], updated=r["date"]), resources)
    )
    resource_names = list(map(lambda r: r["type"], resources))
    selected_resources = questionary.checkbox(
        "Which demographic groups do you want to include?", choices=resource_names
    ).ask()

    return list(
        filter(lambda resource: resource["type"] in selected_resources, resources)
    )
