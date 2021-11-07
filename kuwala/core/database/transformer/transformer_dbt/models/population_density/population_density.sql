SELECT
       h3_to_parent(h3_index::h3index, {{ var('grid_resolution') }}) AS h3_index,
       sum(total) AS total,
       sum(children_under_five) AS children_under_five,
       sum(elderly_60_plus) AS elderly_60_plus,
       sum(men) AS men,
       sum(women) AS women,
       sum(women_of_reproductive_age_15_49) AS women_of_reproductive_age_15_49,
       sum(youth_15_24) AS youth_15_24
FROM population_density
GROUP BY h3_to_parent(h3_index::h3index, {{ var('grid_resolution') }})