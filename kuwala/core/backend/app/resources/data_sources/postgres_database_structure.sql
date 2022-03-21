SELECT
    table_schema AS schema,
    CASE table_type
    WHEN 'BASE TABLE' THEN 'tables'
    WHEN 'VIEW' THEN 'views'
    ELSE table_type END AS type,
    table_name AS "table"
FROM (
     SELECT table_schema, table_type, table_name
FROM information_schema.tables
ORDER BY table_schema, table_type, table_name
) as database_structure
GROUP BY table_schema, table_type, table_name
