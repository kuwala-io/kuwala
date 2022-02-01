from wrapper.locations import location_wrapper
import argparse    

if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    default_header = {}
    default_header['User-agent'] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"

    ## Necessary Arguments
    parser.add_argument('--location_id', help='Location id to scrape', default='')
    parser.add_argument('--process_type', help='Available type = locations | hashtag | profile', default='')

    ## Optional Arguments
    parser.add_argument('--max_sessions', help='Maximum tor session created', default=1000)
    parser.add_argument('--max_posts', help='Maximum post scrapped', default = 100000)
    parser.add_argument('--max_session_time', help='Maximum tor session up time', default = 3600 * 3) # 3 Hour Per Session
    parser.add_argument('--max_request_per_session', help='Maximum number of requests from a single tor session', default=1000)
    parser.add_argument('--continue_last_cursor', help='Continue from last saved cursor', default=True)
    parser.add_argument('--log_error', help='Log error to /errors/', default=False)
    parser.add_argument('--request_sleep_time', help='Sleep time after every session request', default=15)
    parser.add_argument('--headers', help='Request headers', default=default_header)


    args = parser.parse_args()

    ## Config Definition
    max_sessions = args.max_sessions
    max_posts = args.max_posts
    max_session_time = args.max_session_time
    max_request_per_session = args.max_request_per_session
    continue_last_cursor = args.continue_last_cursor
    log_error = args.log_error
    location_id = args.location_id
    request_sleep_time = args.request_sleep_time
    headers = args.headers
    process_type = args.process_type

    if process_type == 'locations':
        print('\nScrapping locations')
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
    
    elif process_type == 'hashtag':
        print('\nHashtag processor is currently un anavailable\n')

    elif process_type == 'profile':
        print('\nProfile processor is currently un anavailable\n')
    
    else:
        print('\nUnknown Process Type\n')
    
    print("=@= Process Completed! =@=")
