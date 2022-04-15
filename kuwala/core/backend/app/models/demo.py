import os
from tempfile import tempdir
import psycopg2
import pandas as pd
import pandas.io.sql as sqlio
from glob import glob
import csv


# reconstruct Robyn's demo dataset
print("Importing demo data...")
conn = psycopg2.connect(
    "host=localhost dbname=kuwala user=kuwala password=password"
    )
cursor = conn.cursor()
query = '''
    SELECT
    marketing_revenue.date, marketing_revenue.revenue,
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
        INNER JOIN marketing_channel_tv ON marketing_revenue.date = marketing_channel_tv.date)
        INNER JOIN marketing_channel_ooh ON marketing_revenue.date = marketing_channel_ooh.date)
        INNER JOIN marketing_channel_print ON marketing_revenue.date = marketing_channel_print.date)
        INNER JOIN marketing_channel_facebook_impression ON marketing_revenue.date = marketing_channel_facebook_impression.date)
        INNER JOIN marketing_search_click ON marketing_revenue.date = marketing_search_click.date)
        INNER JOIN marketing_channel_search ON marketing_revenue.date = marketing_channel_search.date)
        INNER JOIN marketing_competitor_sales ON marketing_revenue.date = marketing_competitor_sales.date)
        INNER JOIN marketing_channel_facebook ON marketing_revenue.date = marketing_channel_facebook.date)
        INNER JOIN marketing_channel_newsletter ON marketing_revenue.date = marketing_channel_newsletter.date)
    '''
# read query result to pandas dataframe
print()
print("Loading data... ")
marketing_data = sqlio.read_sql_query(query, conn, index_col='date')
holiday_data = sqlio.read_sql_query('SELECT * FROM marketing_holiday_list', conn, index_col='index')
temp_dir = '../../../../tmp/kuwala/models/robyn/'
if not os.path.exists(temp_dir):
    os.makedirs(temp_dir)
# saving the data to csv
marketing_data.to_csv(temp_dir+"marketing_data.csv")
holiday_data.to_csv(temp_dir+'holiday_data.csv')


# run demo
print()
print(
    """
    If install.packages related error occurs:
    install 'remotes' packages by go to terminal,
    call R in terminal, then install.packages('remote')
    """
        )
os.system('Rscript robyn_demo.r')

# export result to database
print()
print("Importing latest fitting result to database...")

create_query = '''
CREATE TABLE robyn_results (
    solID char(20) NOT NULL,\
    channels char(20),\
    date_min date,\
    date_max date,\
    periods char(20),\
    constr_low float,\
    constr_up float,\
    histSpend float,\
    histSpendTotal float,\
    initSpendUnitTotal float,\
    initSpendUnit float,\
    initSpendShare float,\
    initResponseUnit float,\
    initResponseUnitTotal float,\
    initRoiUnit float,\
    expSpendTotal float,\
    expSpendUnitTotal float,\
    expSpendUnitDelta float,\
    optmSpendUnit float,\
    optmSpendUnitDelta float,\
    optmSpendUnitTotal float,\
    optmSpendUnitTotalDelta float,\
    optmSpendShareUnit float,\
    optmResponseUnit float,\
    optmResponseUnitTotal float,\
    optmRoiUnit float,\
    optmResponseUnitLift float,\
    optmResponseUnitTotalLift float)
'''
cursor.execute(create_query)

os.chdir(temp_dir)
selected_results = glob(os.getcwd()+'/*init')
files = glob(selected_results[0]+"/*_reallocated.csv")

with open(files[0], 'r') as f:
    next(f)
    cursor.copy_from(f, 'robyn_results', sep=',')

conn.commit()
