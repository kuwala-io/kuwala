
# load data form postgres:
import psycopg2
import pandas as pd
import pandas.io.sql as sqlio

#reconstruct Robyn's demo dataset
conn = psycopg2.connect("host=localhost dbname=kuwala user=kuwala password=password")
cursor = conn.cursor()
query =  '''
    SELECT
    marketing_revenue.index, marketing_revenue.date, marketing_revenue.revenue,
    marketing_channel_tv.\"tv_S\",
    marketing_channel_ooh.\"ooh_S\",
    marketing_channel_print.\"print_S\",
    marketing_channel_facebook_impression.\"facebook_I\",
    marketing_search_click.\"search_clicks_P\",
    marketing_channel_search.\"search_S\",
    marketing_competitor_sales.\"competitor_sales_B\",
    marketing_channel_facebook.\"facebook_S\",
    marketing_revenue.events,
    marketing_channel_newsletter.newsletter
    
    FROM(((((((((marketing_revenue
        INNER JOIN marketing_channel_tv ON marketing_revenue.index = marketing_channel_tv.index)
        INNER JOIN marketing_channel_ooh ON marketing_revenue.index = marketing_channel_ooh.index)
        INNER JOIN marketing_channel_print ON marketing_revenue.index = marketing_channel_print.index)
        INNER JOIN marketing_channel_facebook_impression ON marketing_revenue.index = marketing_channel_facebook_impression.index)
        INNER JOIN marketing_search_click ON marketing_revenue.index = marketing_search_click.index)
        INNER JOIN marketing_channel_search ON marketing_revenue.index = marketing_channel_search.index)
        INNER JOIN marketing_competitor_sales ON marketing_revenue.index = marketing_competitor_sales.index)
        INNER JOIN marketing_channel_facebook ON marketing_revenue.index = marketing_channel_facebook.index)
        INNER JOIN marketing_channel_newsletter ON marketing_revenue.index = marketing_channel_newsletter.index)
    '''
#read query result to pandas dataframe
marketing_data = sqlio.read_sql_query(query, conn, index_col='index')