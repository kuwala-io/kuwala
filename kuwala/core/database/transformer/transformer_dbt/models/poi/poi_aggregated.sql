SELECT
    h3_to_parent(poi_h3_index::h3index, {{ var('grid_resolution') }}) AS h3_index,
    count(poi_id) AS pois_total,
    avg(poi_confidence_google) AS poi_confidence_google_average,
    sum(poi_reviews) AS poi_reviews_total,
    avg(poi_rating) AS poi_rating_average,
    avg(poi_price_level) AS poi_price_level_average,
    sum(poi_opening_time_total) AS poi_opening_time_total,
    sum(poi_popularity_total) AS poi_popularity_total,
    sum(poi_popularity_morning_total) AS poi_popularity_morning_total,
    sum(poi_popularity_noon_total) AS poi_popularity_noon_total,
    sum(poi_popularity_afternoon_total) AS poi_popularity_afternoon_total,
    sum(poi_popularity_evening_total) AS poi_popularity_evening_total,
    count(CASE WHEN poi_closed THEN 1 END) AS poi_closed_total,
    count(CASE WHEN poi_closed_permanently THEN 1 END) AS poi_closed_permanently_total,
    avg(poi_spending_time) AS poi_spending_time_average,
    avg(poi_waiting_time) AS poi_waiting_time_average,
    count(poi_inside_of) AS poi_inside_of_total
FROM {{ ref('poi') }}
GROUP BY h3_to_parent(poi_h3_index::h3index, {{ var('grid_resolution') }})