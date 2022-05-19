[![Slack](https://img.shields.io/badge/slack-chat-orange.svg)](https://join.slack.com/t/kuwala-community/shared_invite/zt-l5b2yjfp-2cdhReNACXDkLhuh0jFzZw)
![License](https://img.shields.io/github/license/kuwala-io/kuwala)

<img src="./docs/images/kuwala_header_github.png" width="100%" />

<p align="center">
  <a href="https://join.slack.com/t/kuwala-community/shared_invite/zt-l5b2yjfp-2cdhReNACXDkLhuh0jFzZw"><img src="./docs/images/slack_join_button_github.png" height="96" /></a>
  <a href="https://github.com/orgs/kuwala-io/projects/3/views/6"><img src="./docs/images/roadmap_button_github.png" height="96" /></a>
</p>

Kuwala is **the no-code data platform for BI analysts and engineers enabling you to build powerful analytics workflows.** 
We are set out to bring **state-of-the-art data engineering tools** you love, such as 
[Airbyte](https://github.com/airbytehq/airbyte), [dbt](https://github.com/dbt-labs/dbt-core), or 
[Great Expectations](https://github.com/great-expectations/great_expectations) together in one intuitive interface built 
with [React Flow](https://github.com/wbkd/react-flow).

Do you want to **discuss your first contribution**, want to **learn more in general**, or 
**discuss your specific use-case** for Kuwala? Just **book a digital coffee session** with the core team 
[here](https://calendly.com/kuwala_io/kuwala-community-chat).

![Collaboration between BI analysts and engineers](./docs/images/kuwala_collaborative_cycle.png)

Kuwala stands for **extendability, reproducibility, and enablement**. Small data teams build data products fastly and 
collaboratively. Analysts and engineers stay with their strengths. Kuwala  is the tool that makes it possible to keep a 
data project within scope while having fun again.

- **Kuwala Canvas runs directly on a data warehouse** = Maximum flexibility and no lock-in effect
- **Engineers enable their analysts** by adding transformations and models via dbt or new data sources through Airbyte
- **The node-based editor enables analyst** to build advanced data workflows with many data sources and transformations through simple drag-and-drop
- **With models-as-a-block** the BI analyst can launch advanced Marketing Mix Models and attributions without knowing R or Python

<img src="./docs/images/tool_description_github.png" width="100%" style="background-color: white" />

### Extract and Load with Airbyte

For connecting and loading all your tooling data into a data warehouse, we are integrating with Airbyte connectors. For
everything related to third-party data, such as POI and demographics data, we are building separate data pipelines.

### Transform with dbt

To apply transformations on your data, we are integrating dbt which is running on top of your data warehouses. Engineers 
can easily create dbt models and make them reusable to the frontend.

### Run a Data Science Model

We are going to include open-source data science and AI models (e.g., [
Meta's Robyn Marketing Mix Modeling](https://github.com/facebookexperimental/Robyn)).

### Report

We make the results exportable to Google Sheets and in the future also available in a Medium-style markdown editor.

---

# How can I use Kuwala?

### Canvas

The canvas environment is currently WIP. But you can already get an idea of how it is going to look like with our
[prototype](https://www.figma.com/proto/Dbpnc4yGV19ppRhr9k5BsU/Kuwala_UI?node-id=1494%3A112067&scaling=scale-down-width&starting-point-node-id=1494%3A112067)
and checkout our [roadmap]() for updates.

### Third-party data connectors

We currently have five pipelines for different third-party data sources which can easily be imported into a Postgres 
database. The following pipelines are integrated:

 - [Admin Boundaries](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/admin-boundaries/README.md)
 - [Google POIs](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/google-poi/README.md)
 - [Google Trends](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/google-trends/README.md)
 - [OSM POIs](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/osm-poi/README.md)
 - [Population Density](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/population-density/README.md)

### Jupyter environment & CLI

Before the canvas is built, we have a Jupyter environment with convenience functions to work with the third-party data 
pipelines. To easily run the data pipelines, you can use the CLI.

#### Quickstart & Demo

##### *Demo correlating Uber traversals with Google popularities*

[![badge](https://img.shields.io/badge/launch-demo-579ACA.svg?logo=data:image/png;base64,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)](https://mybinder.org/v2/gh/kuwala-io/kuwala_examples/1def41ded01dbb67ecada9dc227c834cd93d0721?urlpath=lab%2Ftree%2Fnotebooks%2F1.%20Popularity%20Correlation.ipynb)

![Jupyter Notebook Popularity Correlation](./docs/images/jupyter_notebook_popularity_correlation.png)

We have a notebook with which you can correlate any value associated with a geo-reference with the Google popularity 
score. In the demo, we have preprocessed popularity data and a test dataset with Uber rides in Lisbon, Portugal.

#### Run the demo

You could either use the deployed example on Binder using the badge above or run everything locally. The Binder example
simply uses Pandas dataframes and is not connecting to a data warehouse. 

<details>
    <summary>Setting up and running the CLI</summary><br/>

#### Prerequisites

1. Installed version of `Docker` and `docker-compose v2`.
   - We recommend using the latest version of [`Docker Desktop`](https://www.docker.com/products/docker-desktop).
2. Installed version of `Python3` and *latest* `pip, setuptools, and wheel` version.
   - We recommend using version `3.9.5` or higher.
   - To check your current version run `python3 --version`.
3. Installed version of `libpq`.
   - For Mac, you can use brew: `brew install libpq`
4. Installed version of `postgresql`.
   - For Mac, you can use brew: `brew install postgresql`

#### Setup

1. Change your directory to `kuwala/core/cli`.
2. Create a virtual environment.
   - For instructions on how to set up a `venv` on different system see [here](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/).
3. Install dependencies by running `pip3 install --no-cache-dir -r requirements.txt`

#### Run

To start the CLI, run the following command from inside the `kuwala/core/cli/src` directory and follow the instructions:

```zsh
python3 main.py
```

</details>

### Using Kuwala components individually

To use Kuwala's components, such as the data pipelines or the Jupyter environment, individually, please refer to the
[instructions under `/kuwala`](https://github.com/kuwala-io/kuwala/blob/master/kuwala/README.md).

---

# Use cases

- [How to build an Uber-like analytics system with Kuwala](https://kuwala.io/data-pipelines/how-to-build-an-uber-like-intelligence-system-for-your-new-mobility-startup-without-a-big-data-team/)
- [Perform location analytics for a grocery store with Kuwala](https://kuwala.io/case-studies/why-instant-grocery-delivery-should-follow-a-data-driven-path-like-uber-to-survive-part-1/)
- [Querying the most granular demographics data set with Kuwala](https://kuwala.io/data-pipelines/querying-the-most-granular-demographics-dataset/)

---

# How can I contribute?

Every new issue, question, or comment is a contribution and very welcome! This project lives from your feedback and
involvement!

## Be part of our community

The best first step to get involved is to join the 
[Kuwala Community on Slack](https://join.slack.com/t/kuwala-community/shared_invite/zt-l5b2yjfp-2cdhReNACXDkLhuh0jFzZw). 
There we discuss everything related to our roadmap, development, and support. 

## Contribute to the project

Please refer to our [contribution guidelines](https://github.com/kuwala-io/kuwala/tree/master/CONTRIBUTING.md) for further information on how to get involved.

---

# Get more content about Kuwala
  Link  | Description    
-------------|-------------
[Blog](https://kuwala.io/blog/) | Read all our blog articles related to the stuff we are doing here. 
[Join Slack](https://join.slack.com/t/kuwala-community/shared_invite/zt-l5b2yjfp-2cdhReNACXDkLhuh0jFzZw) | Our Slack channel with over 170 data engineers and many discussions.
[Jupyter notebook - Popularity correlation](https://mybinder.org/v2/gh/kuwala-io/kuwala_examples/1def41ded01dbb67ecada9dc227c834cd93d0721?urlpath=lab%2Ftree%2Fnotebooks%2F1.%20Popularity%20Correlation.ipynb) | Open a Jupyter notebook on Binder and merge external popularity data with Uber traversals by making use of convenient dbt functions. 
[Podcast](https://anchor.fm/kuwala-io) | Listen to our community podcast and maybe join us on the next show.
[Digital coffee break](https://calendly.com/kuwala_io/kuwala-community-chat?month=2022-02) | Are you looking for new inspiring tech talks? Book a digital coffee chit-chat with one member of the core team.
[Our roadmap](https://github.com/orgs/kuwala-io/projects/3/views/6) | See our upcoming milestones and sprint planing.
[Contribution guidelines](https://github.com/kuwala-io/kuwala/tree/master/CONTRIBUTING.md) | Further information on how to get involved.
