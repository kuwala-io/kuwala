from func_timeout import func_timeout
from scrapper import locations

def location_wrapper(
    max_sessions,
    max_posts,
    max_session_time,
    max_request_per_session,
    continue_last_cursor,
    log_error,
    location_id,
    request_sleep_time,
    headers
):
    i = 0
    scrapped_posts = 0

    if not location_id or location_id == '':
        print("\n=== Make sure location id is supplied! ===\n")
        return

    ## Read number of scrapped post
    if continue_last_cursor:
        try:
            file = open(f"data_{location_id}.csv", "r")
            line_count = 0
            for line in file:
                if line != "\n":
                    line_count += 1
            file.close()
            scrapped_posts = line_count - 1 ## Account for the header
            print(f"\nLast Session scrapped post: {scrapped_posts}")
        except:
            print(f"\nContinue Last Session specified but no CSV file found")

        try:
            file =open(f"cursors_{location_id}.txt", 'r')
            last_cursor = file.readlines()[-1]
            if last_cursor.strip() == "LAST_CURSOR_REACHED":
                print("\n=== Last Session is Already Reached Last Page ===\n")
                return
        except:
            print(f"\nContinue Last Session specified but no Cursor file found")
        

    # Main Loop & Create Tor Session every Loop
    while i < max_sessions:
        try:
            print(f'\n\nIteration {i+1}')

            # Will return number of scrapped posts
            temp_res = func_timeout(
                max_session_time, 
                locations.scrape_location, 
                args=([
                    location_id,
                    "",
                    continue_last_cursor, # Continue Last Cursor Default to False
                    log_error, # Log Error default to False
                    max_request_per_session, # Max Request per Session Default to 100
                    scrapped_posts, # Number of Post Scrapped
                    max_posts,# Maximum Number of Post to Scrape,
                    headers,
                    request_sleep_time, # 15+ Seconds is Recommended
                ])
            )

            if temp_res == "NO_LOCATION_ID":
                print("\n=== Make sure location id is supplied! ===\n")
                break
            elif temp_res == "MAX_POST_REACHED":
                print("\n=== Maximum Number of Posts Exceeded ===\n")
                break
            elif temp_res == "ALL_POST_SCRAPPED":
                print("\n=== All Post Have Been Scrapped ===\n")
                break
            elif temp_res == "NO_NEXT_PAGE":
                print("\n=== Last Page Reached, No Available Next Cursor found ===\n")
                break
            elif temp_res == "NO_DATA":
                print("\n=== No Data to Scrap ===\n")
                break
            else:
                scrapped_posts = scrapped_posts + temp_res
                if scrapped_posts >= max_posts:
                    print("\n=== Maximum Number of Posts Exceeded ===\n")
                    break

        except Exception as e:
            print("Something went wrong")
            print(e)
        i = i+1