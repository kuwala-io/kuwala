-- Creation of population_density table

CREATE TABLE IF NOT EXISTS population_density (
    h3_index varchar(15) NOT NULL,
    total decimal,
    children_under_five decimal,
    elderly_60_plus decimal,
    men decimal,
    women decimal,
    women_of_reproductive_age_15_49 decimal,
    youth_15_24 decimal,
    PRIMARY KEY (h3_index)
);

-- Creation of osm_poi table

CREATE TABLE IF NOT EXISTS osm_poi (
    osm_type text NOT NULL,
    osm_id text NOT NULL,
    tags text[],
    latitude decimal NOT NULL,
    longitude decimal NOT NULL,
    h3_index varchar(15) NOT NULL,
    name text,
    categories text[],
    address_house_nr text,
    address_street text,
    address_zip_code text,
    address_city text,
    address_country text,
    address_full text,
    address_region_neighborhood text,
    address_region_suburb text,
    address_region_district text,
    address_region_province text,
    address_region_state text,
    address_house_name text,
    address_place text,
    address_block text,
    address_details_level text,
    address_details_flats text,
    address_details_unit text,
    phone text,
    email text,
    website text,
    brand text,
    operator text,
    boundary text,
    admin_level smallint,
    type text,
    geo_json text
);