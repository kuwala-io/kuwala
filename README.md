![Logo Banner](./docs/images/Kuwala%20Title%20Banner.png)

![License](https://img.shields.io/github/license/kuwala-io/kuwala)


### The Vision of a Global Liquid Data Economy

With Kuwala, we want to enable the global liquid data economy. You probably also envision a future of smart cities, autonomously driving cars, and sustainable living. For all of that, we need to leverage the power of data. Unfortunately, many promising data projects fail, however. That's because too many resources are necessary for gathering and cleaning data. Kuwala supports you as a data engineer, data scientist, or business analyst to create a holistic view of your ecosystem by integrating third-party data seamlessly.

### How Kuwala works

Kuwala explicitly focuses on integrating third-party data, so data that is not under your company's influence, e.g., weather or population information. To easily combine several different domains, we further narrow it down to data with a geo-component which still includes many sources. For matching data on different aggregation levels, such as POIs to a moving thunderstorm, we leverage [Uber's H3](https://eng.uber.com/h3/) spatial indexing.

Connectors wrap individual data sources. Within the connector, raw data is cleaned and preprocessed. Based on that, the connector exposes query functions through REST and GraphQL endpoints. Through this, you can easily combine connectors and build further applications and pipelines on top of them. We plan on releasing an open-source solution specifically for this purpose.

### How you can contribute

The best first step to get involved is to [join](https://join.slack.com/t/kuwala-community/shared_invite/zt-l5b2yjfp-pXKFBjbnl7_P3nXtwca5ag) the Kuwala Community on Slack. There we discuss everything related to data integration and new connectors. Every connector will be open-source. We entirely decide, based on you, our community, which sources to integrate. You can reach out to us on Slack or [email](mailto:community@kuwala.io) to request a new connector or contribute yourself. If you want to contribute yourself, you can use your choice's programming language and database technology. We have the only requirement that it is possible to run the connector locally, query the data through REST-API endpoints, and use [Uber's H3](https://eng.uber.com/h3/) functionality to handle geographical transformations. We will then take the responsibility to maintain your connector.

### Liberating the work with data

By working together as a community of data enthusiasts, we can create a network of seamlessly integratable connectors. It is now causing headaches to integrate third-party data into applications. But together, we will make it straightforward to combine, merge and enrich data sources for powerful models.

### What's coming next for the connectors?
Based on the use-cases we have discussed in the community and potential users, we have identified a variety of data sources to connect with next:

#### Semi-structured data
Already structured data but not adapted to the Kuwala framework:

- Google Trends - https://github.com/GeneralMills/pytrends
- Instascraper - https://github.com/chris-greening/instascrape
- GDELT - https://www.gdeltproject.org/
- Worldwide Administrative boundaries - https://index.okfn.org/dataset/boundaries/
- Worldwide scaled calendar events (e.g. bank holidays, school holidays) - https://github.com/commenthol/date-holidays

#### Unstructured data
Unstructured data becomes structured data:
- Building Footprints from satellite images

#### Wishlist
Data we would like to integrate, but a scalable approach is still missing:

- Small scale events (e.g., a festival, movie premiere, nightclub events)

---

## Using existing connectors

To use our published connectors clone this repository and navigate to ```kuwala-connectors```. There is a separate README for each connector on how to get started with it.

We currently have the following connectors published:
- ```population-density```: Detailed population and demographic data