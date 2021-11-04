SELECT
       internal_id,
       place_id,
       name,
       categories,
       tags,
       address,
       number_of_reviews,
       rating_stars,
       price_level,
       opening_time_total,
       popularity_total,
       popularity_morning_total,
       popularity_noon_total,
       popularity_afternoon_total,
       popularity_evening_total,
       temporarily_closed,
       permanently_closed,
       (spending_time_max + spending_time_min) / 2 AS spending_time,
       waiting_time_total,
       inside_of
FROM google_poi
    LEFT JOIN {{ ref('google_poi_popularity') }} USING (internal_id)
    LEFT JOIN {{ ref('google_poi_opening_hours') }} USING (internal_id)
    LEFT JOIN {{ ref('google_poi_waiting_time') }} USING (internal_id)