from cgi import print_directory
from cmath import log
from wrapper.locations import location_wrapper


def main():
    ## Define the config
    max_sessions = 100
    max_posts = 2000
    max_session_time = 3600 * 1 # 1 Hour
    max_request_per_session = 100 
    continue_last_cursor = True
    log_error = False
    location_id = "1313809508724705"
    request_sleep_time = 5 
    headers = {}
    headers['User-agent'] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"
    process_type = 'locations'

    if process_type == 'locations':
        location_wrapper(
            max_sessions=max_sessions,
            max_posts=max_posts,
            max_session_time=max_session_time,
            max_request_per_session=max_request_per_session,
            continue_last_cursor=continue_last_cursor,
            log_error=log_error,
            location_id=location_id,
            request_sleep_time=request_sleep_time,
            headers=headers,
        )

    if process_type == 'hashtag':
        print('PROCESSING HASHTAG')

    if process_type == 'profile':
        print('PROCESSING PROFILES')
    
    print("=@= Process Completed! =@=")

main()
