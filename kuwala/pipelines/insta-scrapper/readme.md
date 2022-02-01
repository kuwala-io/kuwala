This Pipelines is for Issue:
https://github.com/kuwala-io/kuwala/issues/60



# Instagram Pipelines

This pipelines allows you to scrape only **public** information from instagram it is not supported to scrape private information that requires authorization or login. 



## **Sources & Features :**

1. Locations

   - comments_disabled

   - id
   - shortcode
   - taken_at_timestamp
   - display_url
   - is_video
   - caption
   - comment_count
   - liked_count
   - preview_liked_count
   - owner_id
   - post_height
   - post_width
   - location_name
   - lat
   - long
   - h3
   - country
   - country_id
   - city
   - city_id
   - accessibility_caption
   - video_view_count

2. Hashtag (Coming Soon)

3. Profiles (Coming Soon)



## Usage

Since it is not merged yet, you can clone my fork and checkout to the branch:

```bash
git clone -b features/insta-scrapper https://github.com/arifluthfi16/kuwala.git
```

Navigate to `kuwala/kuwala` until you can see the docker compose file. And then build the image using:

```bash
docker-compose build insta-scrapper
```

### Try to Scrape a Location by Id

You can supply any location id here, to get a location id you can navigate to https://www.instagram.com/explore/locations/. A will be something like `1313809508724705` after you got your location id execute:

```bash
docker-compose run insta-scrapper --location_id=<your_loc_id> --type=locations
```

This command will write the csv results into `/kuwala/tmp/insta_pipelines/locations/`



### Available Arguments

```bash
  -h, --help            show this help message and exit
  --location_id LOCATION_ID
                        Location id to scrape
  --type TYPE           Available type = locations | hashtag | profile
  --max_sessions MAX_SESSIONS
                        Maximum tor session created
  --max_posts MAX_POSTS
                        Maximum post scrapped
  --max_session_time MAX_SESSION_TIME
                        Maximum tor session up time
  --max_request_per_session MAX_REQUEST_PER_SESSION
                        Maximum number of requests from a single tor session
  --continue_last_cursor CONTINUE_LAST_CURSOR
                        Continue from last saved cursor
  --log_error LOG_ERROR
                        Log error to /errors/
  --request_sleep_time REQUEST_SLEEP_TIME
                        Sleep time after every session request
  --headers HEADERS     Request headers
```

The only required arguments to run is `location_id` and `type`



## License

We are not responsible for nor do we take any responsibility for legal claims that might arise. **Use at your own risk!**