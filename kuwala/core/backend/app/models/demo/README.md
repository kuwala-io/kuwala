# Robyn demo
[Robyn](https://github.com/facebookexperimental/Robyn) is an experimental, semi-automated and open-sourced Marketing Mix Modeling (MMM) package from Facebook Marketing Science. It uses various machine learning techniques (Ridge regression with cross validation, multi-objective evolutionary algorithm for hyperparameter optimisation, time-series decomposition for trend & season, gradient-based optimisation for budget allocation etc.) to define media channel efficiency and effectivity, explore adstock rates and saturation curves. It's built for granular datasets with many independent variables and therefore especially suitable for digital and direct response advertisers with rich data sources. Originaly Robyn is available on R. `robyn_demo.r` is a modified version of [demo.r](https://github.com/facebookexperimental/Robyn/blob/main/demo/demo.R) for Kuwala purposes. Later, `robyn_demo.r` will be a template to run Marketing Mix Modeling (MMM) using your own datasets in Kuwala.  


## Prerequisites
1) Install [R](https://www.r-project.org/) (tested on version R 4.1.3).

2) Once R is installed, install `remote` package library to R so we can install Robyn via remote github repository. Do this by going to your terminal, call `R`, then `install.packages('remote')`.

3) Still in the R console, install `reticulate` package by inserting `install.packages("reticulate")` so later Robyn can use Python functions in it.

4) Install `nevergrad` in `reticulate`. In R console, insert: 
```R
virtualenv_create("r-reticulate")
use_virtualenv("r-reticulate", required = TRUE)
py_install("nevergrad", pip = TRUE)
```
Then check Python in R configuration:
```R
py_config() 

## In case nevergrad still can't be installed,
Sys.setenv(RETICULATE_PYTHON = "~/.virtualenvs/r-reticulate/bin/python")
# Reset your R session and re-install Nevergrad

```
**or alternatively**, create virtual environment using `conda`:
```R
conda_create("r-reticulate", "Python 3.9") # Only works with <= Python 3.9 sofar
use_condaenv("r-reticulate")
conda_install("r-reticulate", "nevergrad", pip=TRUE)
# In case nevergrad still can't be installed,
# please locate your python file and run this line with your path:
use_python("~/Library/r-miniconda/envs/r-reticulate/bin/python3.9")
# Alternatively, force Python path for reticulate with this:
Sys.setenv(RETICULATE_PYTHON = "~/Library/r-miniconda/envs/r-reticulate/bin/python3.9")
# Finally, reset your R session and re-install Nevergrad with option 2

```
5) Install Robyn, still in the R console, insert: `remotes::install_github("facebookexperimental/Robyn/R")`, it will install dependencies as well. 

6) Install required libraries in `kuwala/core/backend/requirements.txt`. You can install from this directory using:
```
pip install -r ../../../requrements.txt
``` 

## Database
This automation has been tested by importing Robyn's sample data from database. The sample data was exported to separate tables containing each marketing channels. In order to run properly, these tables need to exist in the database. Those tables and row names are:

* marketing_channel_facebook:
    * index (starts from 1)
    * date (YYYY-MM-DD)
    * facebook_S
    * events (`na` or `event1`)
* marketing_channel_facebook_impression:
    * index (starts from 1)
    * date (YYYY-MM-DD)
    * facebook_I
    * events (`na` or `event1`)
* marketing_channel_newsletter:
    * index (starts from 1)
    * date (YYYY-MM-DD)
    * newsletter
    * events (`na` or `event1`)
* marketing_channel_ooh:
    * index (starts from 1)
    * date (YYYY-MM-DD)
    * ooh_S
    * events (`na` or `event1`)
* marketing_channel_print:
    * index (starts from 1)
    * date (YYYY-MM-DD)
    * print_S
    * events (`na` or `event1`)
* marketing_channel_search:
    * index (starts from 1)
    * date (YYYY-MM-DD)
    * search_S
    * events (`na` or `event1`)
* marketing_channel_tv:
    * index (starts from 1)
    * date (YYYY-MM-DD)
    * tv_S
    * events (`na` or `event1`)
* marketing_competitor_sales:
    * index (starts from 1)
    * date (YYYY-MM-DD)
    * competitor_sales_B
    * events (`na` or `event1`)
* marketing_holiday_list:
    * index (starts from 1)
    * ds (YYYY-MM-DD)
    * holiday
    * country (two-characters country code)
    * year
* marketing_channel_revenue:
    * index (starts from 1)
    * date (YYYY-MM-DD)
    * revenue
    * events (`na` or `event1`)
* marketing_search_click:
    * index (starts from 1)
    * date (YYYY-MM-DD)
    * search_clicks_P
    * events (`na` or `event1`)

as shown above, table related to Robyn input started with *"marketing"*. Sample data available [here](https://github.com/facebookexperimental/Robyn/tree/main/R/data) as Rdata format, a dataframe-like table used by R. After the modeling finished, the results are available in `robyn_results` table in the database. 

## Demo Script Modifications.
The original [demo.r](https://github.com/facebookexperimental/Robyn/blob/main/demo/demo.R) designed to be run on Rstudio with some script to do image plotting. Since we are automating the script using R console, plotting syntax has been disabled. Functions and syntax to *save graph and curve images* yet still enabled and available in `tmp/kuwala/models/robyn`.

Robyn reads input data in the form of Rdata, so dataframe conversion to Rdata was added. Commentary from the original `demo.r` also minimised. Please refer to the Robyn's demo to learn more.