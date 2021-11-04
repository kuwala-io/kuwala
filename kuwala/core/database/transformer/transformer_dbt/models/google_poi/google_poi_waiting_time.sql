SELECT internal_id, SUM(waiting_time) AS waiting_time_total
FROM google_poi_waiting_time
WHERE timestamp BETWEEN {{ var('start_date') }}::timestamp AND {{ var('end_date', CURRENT_TIME) }}::timestamp
GROUP BY internal_id