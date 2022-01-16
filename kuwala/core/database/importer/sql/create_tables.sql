--create types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'osm_type_enum') THEN
        CREATE TYPE osm_type_enum AS ENUM('node', 'way', 'relation');
    END IF;
END$$;

-- Creation of admin_boundary table

CREATE TABLE IF NOT EXISTS admin_boundary (
    id text NOT NULL PRIMARY KEY,
    kuwala_import_country varchar(3) NOT NULL,
    name text NOT NULL,
    h3_index varchar(15) NOT NULL,
    latitude decimal NOT NULL,
    longitude decimal NOT NULL,
    kuwala_admin_level integer NOT NULL,
    osm_admin_level integer NOT NULL,
    parent text REFERENCES admin_boundary(id),
    geo_json text NOT NULL,
    geometry geometry
);

-- Creation of admin_boundary_geonames_cities table

CREATE TABLE IF NOT EXISTS admin_boundary_geonames_cities (
    geoname_id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    ascii_name text,
    alternate_names text[],
    latitude decimal NOT NULL,
    longitude decimal NOT NULL,
    feature_class text NOT NULL,
    feature_code text,
    country_code text,
    alternate_country_codes text[],
    admin_1_code text,
    admin_2_code text,
    admin_3_code text,
    admin_4_code text,
    population integer NOT NULL,
    elevation integer,
    digital_elevation_model integer NOT NULL,
    timezone text NOT NULL,
    modification_date date NOT NULL
);

-- Creation of population_density table

CREATE TABLE IF NOT EXISTS population_density (
    h3_index varchar(15) NOT NULL PRIMARY KEY,
    kuwala_import_country varchar(3) NOT NULL,
    total decimal,
    children_under_five decimal,
    elderly_60_plus decimal,
    men decimal,
    women decimal,
    women_of_reproductive_age_15_49 decimal,
    youth_15_24 decimal
);

-- Creation of osm_poi table

CREATE TABLE IF NOT EXISTS osm_poi (
    osm_type osm_type_enum NOT NULL,
    osm_id text NOT NULL,
    kuwala_import_country varchar(3) NOT NULL,
    h3_index varchar(15) NOT NULL,
    latitude decimal NOT NULL,
    longitude decimal NOT NULL,
    name text,
    tags text[],
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
    geo_json text,
    CONSTRAINT pk_osm_poi PRIMARY KEY (osm_type, osm_id)
);

-- Creation of google_poi table

CREATE TABLE IF NOT EXISTS google_poi (
    internal_id text NOT NULL PRIMARY KEY,
    kuwala_import_country varchar(3) NOT NULL,
    h3_index varchar(15) NOT NULL,
    latitude decimal NOT NULL,
    longitude decimal NOT NULL,
    name text,
    tags text[],
    categories text[],
    place_id text NOT NULL,
    address text[],
    timezone text,
    temporarily_closed bool NOT NULL,
    permanently_closed bool NOT NULL,
    inside_of text,
    price_level integer,
    contact_phone text,
    contact_website text,
    number_of_reviews integer,
    rating_stars decimal,
    spending_time_min integer,
    spending_time_max integer,
    has_popularity bool NOT NULL,
    has_opening_hours bool NOT NULL,
    has_waiting_time bool NOT NULL
);

-- Creation of google_poi_popularity table

CREATE TABLE IF NOT EXISTS google_poi_popularity (
    internal_id text NOT NULL,
    popularity integer NOT NULL,
    timestamp timestamp with time zone NOT NULL,
    CONSTRAINT fk_google_poi_popularity FOREIGN KEY(internal_id) REFERENCES google_poi(internal_id)
);

-- Creation of google_poi_opening_hours table

CREATE TABLE IF NOT EXISTS google_poi_opening_hours (
    internal_id text NOT NULL,
    date timestamp with time zone NOT NULL,
    opening_time timestamp with time zone,
    closing_time timestamp with time zone,
    CONSTRAINT fk_google_poi_opening_hours FOREIGN KEY(internal_id) REFERENCES google_poi(internal_id)
);

-- Creation of google_poi_waiting_time table

CREATE TABLE IF NOT EXISTS google_poi_waiting_time (
    internal_id text NOT NULL,
    waiting_time integer NOT NULL,
    timestamp timestamp with time zone NOT NULL,
    CONSTRAINT fk_google_poi_waiting_time FOREIGN KEY(internal_id) REFERENCES google_poi(internal_id)
);

-- Creation of google_osm_poi_matching table

CREATE TABLE IF NOT EXISTS google_osm_poi_matching (
    osm_type osm_type_enum NOT NULL,
    osm_id text NOT NULL,
    internal_id text NOT NULL,
    confidence decimal NOT NULL,
    name_distance decimal NOT NULL,
    h3_distance decimal NOT NULL,
    query text NOT NULL,
    CONSTRAINT fk_google_osm_poi_matching_google_id FOREIGN KEY(internal_id) REFERENCES google_poi(internal_id),
    CONSTRAINT fk_google_osm_poi_matching_osm_id FOREIGN KEY(osm_type, osm_id) REFERENCES osm_poi(osm_type, osm_id)
);

-- Creation of google_osm_poi_matching table

CREATE TABLE IF NOT EXISTS google_custom_poi_matching (
    custom_id text NOT NULL PRIMARY KEY,
    internal_id text NOT NULL,
    confidence decimal NOT NULL,
    name_distance decimal NOT NULL,
    h3_distance decimal,
    query text NOT NULL,
    CONSTRAINT fk_google_osm_poi_matching_google_id FOREIGN KEY(internal_id) REFERENCES google_poi(internal_id)
);