print("Running Robyn Demo file....")
print("demo file has been modified to comment Rstudio plotting syntax")
library(Robyn)
print("Robyn Version: ")
packageVersion("Robyn")

temp_dir <- '../../../../tmp/kuwala/models/robyn/'
dt_simulated_weekly <- read.csv(paste(temp_dir,'marketing_data.csv',sep=''),stringsAsFactors = F, header=T)
dt_prophet_holidays <- read.csv(paste(temp_dir,'holiday_data.csv',sep=''), stringsAsFactors = F, header=T)
data("dt_prophet_holidays")
data("dt_simulated_weekly")

print("Holiday data: ")
head(dt_prophet_holidays)

print("Data:")
head(dt_simulated_weekly)

robyn_object <- paste(temp_dir,'MyRobyn.RDS',sep='')

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
# print(InputCollect)

hyper_names(adstock = InputCollect$adstock, all_media = InputCollect$all_media)

plot_adstock(plot = FALSE)
plot_saturation(plot = FALSE)

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

InputCollect <- robyn_inputs(InputCollect = InputCollect, hyperparameters = hyperparameters)
# print(InputCollect)

#### Step 3: Build initial model

## Run all trials and iterations. Use ?robyn_run to check parameter definition
OutputModels <- robyn_run(
  InputCollect = InputCollect # feed in all model specification
  #, cores = NULL # default
  #, add_penalty_factor = FALSE # Untested feature. Use with caution.
  , iterations = 2000 # recommended for the dummy dataset
  , trials = 5 # recommended for the dummy dataset
  , outputs = FALSE # outputs = FALSE disables direct model output
)
print(OutputModels)

## Check MOO (multi-objective optimization) convergence plots
# OutputModels$convergence$moo_distrb_plot
# OutputModels$convergence$moo_cloud_plot
# check convergence rules ?robyn_converge
# commented because this will be useful only if we are using Rstudio

## Calculate Pareto optimality, cluster and export results and plots. See ?robyn_outputs
OutputCollect <- robyn_outputs(
  InputCollect, OutputModels
  , pareto_fronts = 3
  # , calibration_constraint = 0.1 # range c(0.01, 0.1) & default at 0.1
  , csv_out = "pareto" # "pareto" or "all"
  , clusters = TRUE # Set to TRUE to cluster similar models by ROAS. See ?robyn_clusters
  , plot_pareto = TRUE # Set to FALSE to deactivate plotting and saving model one-pagers
  , plot_folder = robyn_object # path for plots export
)
print(OutputCollect)

#### Step 4: Select and save the initial model

select_model <- "3_241_1" # select one from above
print("selected model: ")
print(select_model)
ExportedModel <- robyn_save(
  robyn_object = robyn_object # model object location and name
  , select_model = select_model # selected model ID
  , InputCollect = InputCollect # all model input
  , OutputCollect = OutputCollect # all model output
)
print(ExportedModel)

#### Step 5: Get budget allocation based on the selected model above

OutputCollect$xDecompAgg[solID == select_model & !is.na(mean_spend)
                         , .(rn, coef,mean_spend, mean_response, roi_mean
                             , total_spend, total_response=xDecompAgg, roi_total, solID)]

AllocatorCollect <- robyn_allocator(
  InputCollect = InputCollect
  , OutputCollect = OutputCollect
  , select_model = select_model
  , scenario = "max_historical_response"
  , channel_constr_low = c(0.7, 0.7, 0.7, 0.7, 0.7)
  , channel_constr_up = c(1.2, 1.5, 1.5, 1.5, 1.5)
)
print(AllocatorCollect)
AllocatorCollect$dt_optimOut

# Run ?robyn_allocator to check parameter definition
# Run the "max_historical_response" scenario: "What's the revenue lift potential with the
# same historical spend level and what is the spend mix?"
AllocatorCollect <- robyn_allocator(
  InputCollect = InputCollect
  , OutputCollect = OutputCollect
  , select_model = select_model
  , scenario = "max_historical_response"
  , channel_constr_low = c(0.7, 0.7, 0.7, 0.7, 0.7)
  , channel_constr_up = c(1.2, 1.5, 1.5, 1.5, 1.5)
)
print(AllocatorCollect)
AllocatorCollect$dt_optimOut

# Run the "max_response_expected_spend" scenario: "What's the maximum response for a given
# total spend based on historical saturation and what is the spend mix?" "optmSpendShareUnit"
# is the optimum spend share.
AllocatorCollect <- robyn_allocator(
  InputCollect = InputCollect
  , OutputCollect = OutputCollect
  , select_model = select_model
  , scenario = "max_response_expected_spend"
  , channel_constr_low = c(0.7, 0.7, 0.7, 0.7, 0.7)
  , channel_constr_up = c(1.2, 1.5, 1.5, 1.5, 1.5)
  , expected_spend = 1000000 # Total spend to be simulated
  , expected_spend_days = 7 # Duration of expected_spend in days
)
print(AllocatorCollect)
#AllocatorCollect$dt_optimOut

## A csv is exported into the folder for further usage. Check schema here:
## https://github.com/facebookexperimental/Robyn/blob/main/demo/schema.R

## QA optimal response
if (TRUE) {
  cat("QA if results from robyn_allocator and robyn_response agree: ")
  select_media <- "search_S"
  optimal_spend <- AllocatorCollect$dt_optimOut[channels == select_media, optmSpendUnit]
  optimal_response_allocator <- AllocatorCollect$dt_optimOut[channels == select_media, optmResponseUnit]
  optimal_response <- robyn_response(
    robyn_object = robyn_object,
    select_build = 0,
    media_metric = select_media,
    metric_value = optimal_spend)
  cat(round(optimal_response_allocator) == round(optimal_response$response), "( ")
  #plot(optimal_response$plot)
  cat(optimal_response$response, "==", optimal_response_allocator, ")\n")
}

#### Step 6: Model refresh based on selected model and saved Robyn.RDS object - Alpha

Robyn <- robyn_refresh(
  robyn_object = robyn_object
  , dt_input = dt_simulated_weekly
  , dt_holidays = dt_prophet_holidays
  , refresh_steps = 13
  , refresh_mode = "auto"
  , refresh_iters = 1000 # 1k is estimation. Use refresh_mode = "manual" to try out.
  , refresh_trials = 3
  , clusters = TRUE
)
#### Step 7: Get budget allocation recommendation based on selected refresh runs
AllocatorCollect <- robyn_allocator(
  robyn_object = robyn_object
  #, select_build = 1 # Use third refresh model
  , scenario = "max_response_expected_spend"
  , channel_constr_low = c(0.7, 0.7, 0.7, 0.7, 0.7)
  , channel_constr_up = c(1.2, 1.5, 1.5, 1.5, 1.5)
  , expected_spend = 2000000 # Total spend to be simulated
  , expected_spend_days = 14 # Duration of expected_spend in days
)
print(AllocatorCollect)
# plot(AllocatorCollect)

#### Step 8: get marginal returns

# Get response for 80k from result saved in robyn_object
Spend1 <- 60000
Response1 <- robyn_response(
  robyn_object = robyn_object
  #, select_build = 1 # 2 means the second refresh model. 0 means the initial model
  , media_metric = "search_S"
  , metric_value = Spend1)
Response1$response/Spend1 # ROI for search 80k
#Response1$plot

# Get response for 81k
Spend2 <- Spend1 + 1000
Response2 <- robyn_response(
  robyn_object = robyn_object
  #, select_build = 1
  , media_metric = "search_S"
  , metric_value = Spend2)
Response2$response/Spend2 # ROI for search 81k
#Response2$plot

# Marginal ROI of next 1000$ from 80k spend level for search
(Response2$response - Response1$response)/(Spend2 - Spend1)

## Example of getting paid media exposure response curves
imps <- 5000000
response_imps <- robyn_response(
  robyn_object = robyn_object
  #, select_build = 1
  , media_metric = "facebook_I"
  , metric_value = imps)
response_imps$response / imps * 1000
#response_imps$plot

## Example of getting organic media exposure response curves
sendings <- 30000
response_sending <- robyn_response(
  robyn_object = robyn_object
  #, select_build = 1
  , media_metric = "newsletter"
  , metric_value = sendings)
response_sending$response / sendings * 1000
#response_sending$plot