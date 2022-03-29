from multiprocessing import context
from operator import index
import os
from pickle import FALSE
# load data form postgres:
import psycopg2
import pandas as pd
import pandas.io.sql as sqlio

#reconstruct Robyn's demo dataset
print("Importing demo data...")
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
holiday_data = sqlio.read_sql_query('SELECT * FROM marketing_holiday_list', conn, index_col='index')
temp_dir = '../../../../tmp/robyn/'
if not os.path.exists(temp_dir):
    os.makedirs(temp_dir)
marketing_data.to_csv(temp_dir+"marketing_data.csv")
holiday_data.to_csv(temp_dir+'holiday_data.csv')

print("\n loading Robyn...")
# install.packages("remotes") 
# Install remotes first if you haven't already
# remotes::install_github("facebookexperimental/Robyn/R")
# load robyn [wip]
import rpy2.robjects as robjects
import rpy2.robjects.packages as rpackages
from rpy2.robjects.packages import importr
from rpy2.robjects import pandas2ri

pandas2ri.activate()

robyn_object=temp_dir+"MyRobyn.RDS"
robyn = importr('Robyn')
dt_simulated_weekly = robjects.r('read.csv(file = "{temp_dir}marketing_data.csv", header = T )'.format(temp_dir=temp_dir))
dt_prophet_holidays = robjects.r('read.csv(file  = "{temp_dir}holiday_data.csv", header = T )'.format(temp_dir=temp_dir))
prophet_vars = robjects.r('c("trend", "season", "holiday")')
context_vars = robjects.r('c("competitor_sales_B", "events")')
paid_media_vars = robjects.r('c("tv_S", "ooh_S"	,	"print_S"	,"facebook_I" ,"search_clicks_P")')
paid_media_spends = robjects.r('c("tv_S","ooh_S",	"print_S"	,"facebook_S", "search_S")')
organic_vars = robjects.r('c("newsletter")')
factor_vars = robjects.r('c("events")')


robyn_inputs = robyn.robyn_inputs 

# InputCollect_1 = robyn_inputs( 
#    dt_input = dt_simulated_weekly
#   ,dt_holidays = dt_prophet_holidays
#   ,date_var = "date" # date format must be "2020-01-01"
#   ,dep_var = "revenue" # there should be only one dependent variable
#   ,dep_var_type = "revenue" # "revenue" or "conversion"
#   ,prophet_vars = prophet_vars # "trend","season", "weekday" & "holiday"
#   ,prophet_country = "DE"# input one country. dt_prophet_holidays includes 59 countries by default
#   ,context_vars = context_vars # e.g. competitors, discount, unemployment etc
#   ,paid_media_spends = paid_media_spends # mandatory input
#   ,paid_media_vars = paid_media_vars # mandatory.
#   # paid_media_vars must have same order as paid_media_spends. Use media exposure metrics like
#   # impressions, GRP etc. If not applicable, use spend instead.
#   ,organic_vars = organic_vars # marketing activity without media spend
#   ,factor_vars = factor_vars # specify which variables in context_vars or organic_vars are factorial
#   ,window_start = "2016-11-23"
#   ,window_end = "2018-08-22"
#   ,adstock = "geometric" # geometric, weibull_cdf or weibull_pdf.
# )

InputCollect=robjects.r(
    '''
  InputCollect <- robyn_inputs(
  dt_input = dt_simulated_weekly
  ,dt_holidays = dt_prophet_holidays
  ,date_var = "DATE" # date format must be "2020-01-01"
  ,dep_var = "revenue" # there should be only one dependent variable
  ,dep_var_type = "revenue" # "revenue" or "conversion"
  ,prophet_vars = c("trend", "season", "holiday") # "trend","season", "weekday" & "holiday"
  ,prophet_country = "DE"# input one country. dt_prophet_holidays includes 59 countries by default
  ,context_vars = c("competitor_sales_B", "events") # e.g. competitors, discount, unemployment etc
  ,paid_media_spends = c("tv_S","ooh_S",	"print_S"	,"facebook_S", "search_S") # mandatory input
  ,paid_media_vars = c("tv_S", "ooh_S"	,	"print_S"	,"facebook_I" ,"search_clicks_P") # mandatory.
  # paid_media_vars must have same order as paid_media_spends. Use media exposure metrics like
  # impressions, GRP etc. If not applicable, use spend instead.
  ,organic_vars = c("newsletter") # marketing activity without media spend
  ,factor_vars = c("events") # specify which variables in context_vars or organic_vars are factorial
  ,window_start = "2016-11-23"
  ,window_end = "2018-08-22"
  ,adstock = "geometric" # geometric, weibull_cdf or weibull_pdf.
)

'''
)

print("The InputCollect contains:")
print(InputCollect)

adstock = robjects.r.list('geometric') # geometric, weibull_cdf or weibull_pdf. make it same with before
all_media = robjects.r('c("tv_S","ooh_S","print_S","facebook_S", "search_S", "newsletter")')
# all_media = paid_media_spedns + organic_vars

#hyper_names= robyn.hyper_names(adstock = adstock, all_media = all_media)
hyper_names = robyn.hyper_names(adstock = robjects.r('InputCollect$adstock'), all_media = robjects.r('InputCollect$all_media'))
hyper_names = robjects.r ('hyper_names(adstock = InputCollect$adstock, all_media = InputCollect$all_media)')

robyn.plot_adstock = FALSE
robyn.plot_stauration = FALSE

hyperparameters = robjects.r (
    '''
   hyperparameters <- list(
  facebook_S_alphas = c(0.5, 3)
  ,facebook_S_gammas = c(0.3, 1)
  ,facebook_S_thetas = c(0, 0.3)

  ,print_S_alphas = c(0.5, 3)
  ,print_S_gammas = c(0.3, 1)
  ,print_S_thetas = c(0.1, 0.4)

  ,tv_S_alphas = c(0.5, 3)
  ,tv_S_gammas = c(0.3, 1)
  ,tv_S_thetas = c(0.3, 0.8)

  ,search_S_alphas = c(0.5, 3)
  ,search_S_gammas = c(0.3, 1)
  ,search_S_thetas = c(0, 0.3)

  ,ooh_S_alphas = c(0.5, 3)
  ,ooh_S_gammas = c(0.3, 1)
  ,ooh_S_thetas = c(0.1, 0.4)

  ,newsletter_alphas = c(0.5, 3)
  ,newsletter_gammas = c(0.3, 1)
  ,newsletter_thetas = c(0.1, 0.4)
  )
  
    '''
)

# hyperparameters = robjects.ListVector 
# ({
#     'facebook_S_alphas': {0.5,3}, 
#     'facebook_S_gammas': {0.3,1}, 
#     'facebook_S_thetas': {0,0.3},
#     'print_S_alphas': {0.5,3}, 
#     'print_S_gammas': {0.3,1}, 
#     'print_S_thetas': {0.1,0.4},
#     'tv_S_alphas': {0.5,3}, 
#     'tv_S_gammas': {0.3,1}, 
#     'tv_S_thetas': {0.3,0.8},
#     'search_S_alphas': {0.5,3}, 
#     'search_S_gammas': {0.3,1}, 
#     'search_S_thetas': {0,0.3},
#     'ooh_S_alphas': {0.5,3}, 
#     'ooh_S_gammas': {0.3,1}, 
#     'ooh_S_thetas': {0.1,0.4},
#     'newsletter_alphas': {0.5,3}, 
#     'newsletter_gammas': {0.3,1},
#     'newsletter_thetas': {0.1,0.4}
# })

#print(robjects.r('order(names(hyperparameters))'))
# print(robjects.r.list(InputCollect_1[0]))
#print(robjects.r('print(hyperparameters)'))
InputCollect = robyn_inputs(InputCollect = InputCollect, hyperparameters = hyperparameters)
#InputCollect = robjects.r ('InputCollect <- robyn_inputs(InputCollect = InputCollect, hyperparameters = hyperparameters')
print(InputCollect)
robyn_run =  robyn.robyn_run

# OutputModels = robyn_run(
#     InputCollect = InputCollect # feed in all model specification
#   #, cores = NULL # default
#   #, add_penalty_factor = FALSE # Untested feature. Use with caution.
#   , iterations = 2000 # recommended for the dummy dataset
#   , trials = 5 # recommended for the dummy dataset
#   , outputs = FALSE # outputs = FALSE disables direct model output
# )

OutputModels1= robjects.r (
    '''
    InputCollect <- robyn_inputs(InputCollect = InputCollect, hyperparameters = hyperparameters)
    OutputModels <- robyn_run(
        InputCollect = InputCollect # feed in all model specification
        #, cores = NULL # default
        #, add_penalty_factor = FALSE # Untested feature. Use with caution.
        , iterations = 2000 # recommended for the dummy dataset
        , trials = 5 # recommended for the dummy dataset
        , outputs = FALSE # outputs = FALSE disables direct model output
)
'''
)
print(OutputModels1)
