
## Using Pipelines Independently

Apart from using the CLI, you can also run the pipelines individually without Docker. For more detailed instructions
please take a look at the [`./kuwala/README.md`](https://github.com/kuwala-io/kuwala/tree/master/kuwala/README.md).

We currently have the following pipelines published:
- [`osm-poi`](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/osm-poi):
  Global collection of point of interests (POIs)
- [`population-density`](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/population-density): 
  Detailed population and demographic data
- [`google-poi`](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/google-poi):
  Scraping API to retrieve POI information from Google (incl. popularity score)

*Experimental:*

- [`admin-boundaries`](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/admin-boundaries):
  Worldwide administrative boundaries
- [`google-trends`](https://github.com/kuwala-io/kuwala/tree/master/kuwala/pipelines/google-trends):
  Detailed insights into search trends for keywords in specific regions
