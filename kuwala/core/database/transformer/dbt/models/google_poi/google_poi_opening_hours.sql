SELECT internal_id, SUM(EXTRACT(EPOCH FROM (closing_time - opening_time)) / 3600) AS opening_time_total
FROM google_poi_opening_hours
WHERE
  date BETWEEN {{ var('start_date') }}::timestamp AND {{ var('end_date', CURRENT_TIME) }}::timestamp AND
  opening_time IS NOT NULL AND closing_time IS NOT NULL
GROUP BY internal_id