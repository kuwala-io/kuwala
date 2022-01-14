WITH popularity_total AS (
    SELECT internal_id, SUM(popularity) AS popularity_total
    FROM google_poi_popularity
    WHERE timestamp BETWEEN {{ var('start_date') }}::timestamp AND {{ var('end_date', CURRENT_TIME) }}::timestamp
    GROUP BY internal_id
),

popularity_morning_total AS (
    SELECT internal_id, SUM(popularity) AS popularity_morning_total
    FROM google_poi_popularity
    WHERE
      timestamp BETWEEN {{ var('start_date') }}::timestamp AND {{ var('end_date', CURRENT_TIME) }}::timestamp AND
      EXTRACT(HOUR FROM timestamp) BETWEEN {{ var('first_morning_hour', 0) }} AND {{ var('last_morning_hour', 9) }}
    GROUP BY internal_id
),

popularity_noon_total AS (
    SELECT internal_id, SUM(popularity) AS popularity_noon_total
    FROM google_poi_popularity
    WHERE
      timestamp BETWEEN {{ var('start_date') }}::timestamp AND {{ var('end_date', CURRENT_TIME) }}::timestamp AND
      EXTRACT(HOUR FROM timestamp) BETWEEN ({{ var('last_morning_hour', 9) }} + 1) AND {{ var('last_noon_hour', 13) }}
    GROUP BY internal_id
),

popularity_afternoon_total AS (
    SELECT internal_id, SUM(popularity) AS popularity_afternoon_total
    FROM google_poi_popularity
    WHERE
      timestamp BETWEEN {{ var('start_date') }}::timestamp AND {{ var('end_date', CURRENT_TIME) }}::timestamp AND
      EXTRACT(HOUR FROM timestamp) BETWEEN ({{ var('last_noon_hour', 13) }} + 1) AND {{ var('last_afternoon_hour', 17) }}
    GROUP BY internal_id
),

popularity_evening_total AS (
    SELECT internal_id, SUM(popularity) AS popularity_evening_total
    FROM google_poi_popularity
    WHERE
      timestamp BETWEEN {{ var('start_date') }}::timestamp AND {{ var('end_date', CURRENT_TIME) }}::timestamp AND
      EXTRACT(HOUR FROM timestamp) > ({{ var('last_afternoon_hour', 17) }}) OR
      EXTRACT(HOUR FROM timestamp) < {{ var('first_morning_hour', 0) }}
    GROUP BY internal_id
)

SELECT * FROM popularity_total
    LEFT JOIN popularity_morning_total USING (internal_id)
    LEFT JOIN popularity_noon_total USING (internal_id)
    LEFT JOIN popularity_afternoon_total USING (internal_id)
    LEFT JOIN popularity_evening_total USING (internal_id)
