# Google Trends

### EXPERIMENTAL: Pipeline is WIP and not fully functional yet

[Google Trends](https://trends.google.com/trends) is a tool provided by Google that provides insights in search trends
of specific terms. The search volume of one or up to five search terms is indexed from 0 to 100 in a given timeframe. The 
scope of the analysis can be further configured by parameters such as geography, category, or channel.

This pipeline builds on top of [pytrends](https://github.com/GeneralMills/pytrends) which is used to query data from
Google Trends.

---

## Run

### Rate Limits

In order to not run into rate limits, you have to use a proxy. You can specify the proxy address through the environment
variable `PROXY_ADDRESS` (e.g., when using Tor, the value should be `socks5://localhost:9150`).

### Parameters

The current pipeline retrieves the trend score for a search term per admin boundary in a given region by combining it
with the respective admin boundary. For this, the admin boundaries have to be generated first by running the 
[admin-boundaries](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/admin-boundaries) pipeline.

Those are the command line parameters for setting the geographic scope and search term:
- `--continent`
- `--country`
- `--country_region`
- `--keyword`

---
### License

We are neither providing nor are we responsible for the Google Trend data. This repository is purely a tool for working
with that data. We are not responsible for nor do we take any responsibility for legal claims that might arise. 
Use at your own risk.