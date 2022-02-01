from pkg_resources import ResolutionError
from torpy.http.requests import TorRequests, tor_requests_session
from tqdm import tqdm
import json
from utils import tor
import time
import pandas as pd
import h3
import os

def scrape_location(
        location_id='', 
        request_cursor ='', 
        continue_last_cursor=False, 
        log_error = False,
        max_request_per_session = 100,
        number_of_post_scrapped = 0,
        maximum_post_to_scrap = 20,
        headers = {},
        request_sleep_time = 20 
    ):

    if not location_id or location_id == '':
        return "NO_LOCATION_ID"

    with TorRequests() as tor_requests:
        
        with tor_requests.get_session() as sess:
            relay_ip = tor.get_relay_address(sess)
            print(f"Cirtcuit Created with Relay : {relay_ip}")
            number_of_requests = 0

            ## Check if it continues from the latest cusor
            if continue_last_cursor:
                ## Read & Set Latest Cusor as Current Request Cursor
                try:
                    with open(f"cursors_{location_id}.txt", 'r') as f:
                        request_cursor = f.readlines()[-1]
                        print(f"Continuing from last Session with Cursor {request_cursor}")
                except:
                    print("Cursor not found, fresh start")
                    request_cursor = ''
            
            # Request Loop for This Tor Session
            while number_of_requests < max_request_per_session:
                try:
                    request_url = generate_location_url(location_id, request_cursor)
                    print(f"@ Requests {number_of_requests+1} of Session {relay_ip}")
                    print(f"Requests Url: {request_url}")

                    ## Fire requests and return as JSON
                    response = sess.get(request_url,headers = headers)
                    result = response.json() 
                    
                except Exception as e:
                    try:
                        print(f'Error cause : {e}')
                        print("Last response: {}".format(response))
                        if(log_error):
                            file = open(f'errors/error_{location_id}_{time.time()}.txt', 'x')
                            file.write(f'LOCATION ID \t\t:\t{location_id}\n')
                            file.write(f'REQUESTS URL \t\t:\t{generate_location_url(location_id, request_cursor)}\n')
                            file.write(f'ERROR CAUSE \t\t:\t{e}\n')
                            file.write(f'TIMESTAMP \t\t\t:\t{time.time()}\n\n')
                            file.write(format(response.text))
                            file.close()
                    except Exception as e:
                        print(e)
                        print("Unknown Error / Tor End Node Blocked")
                    return False # go back to main loop and get next session

                # Process data when it is successfully fetched
                ## Determine if result is valid
                if result['graphql']['location'] == None:
                    return "NO_DATA"

                ## Get Data Points
                data = result['graphql']['location']['edge_location_to_media']
                location_info = result['graphql']['location']
                location_directory = result['graphql']['directory']
                total_posts = data['count']
                node_list = data['edges']
                number_of_post_scrapped = number_of_post_scrapped + len(node_list) if isinstance(len(node_list), int) else 0

                print(f"Scrapped : {len(node_list)}")
                print(f"Current Total : {number_of_post_scrapped}/{total_posts}")

                ## Get Key Information
                ## Such as : Location name, Lat, Long, H3 Index
                h3_index = get_h3_index(location_info['lat'], location_info['lng'])
                key_info = {
                    'location_name': location_info['name'],
                    'lat': location_info['lat'],
                    'long': location_info['lng'],
                    'h3': str(h3_index),
                    'country': location_directory['country']['name'],
                    'country_id': location_directory['country']['id'],
                    'city': location_directory['city']['name'],
                    'city_id': location_directory['city']['id']
                }

                ## Enrich & Shape data
                posts = [enrich_and_shape_post(i["node"], key_info) for i in node_list]

                ## Load Data & Need To Append CSV
                pf = pd.json_normalize(posts)
                file_name = f"data_{location_id}.csv"
                pf.to_csv(file_name, mode='a', header=not os.path.exists(file_name), index=False)

                # Determine Next Cursor
                
                ## Get End Cusor (Last Post Id)
                response_end_cursor = data['page_info']['end_cursor']
                has_next_page = data['page_info']['has_next_page']

                if not has_next_page or not response_end_cursor:
                    file = open(f"cursors_{location_id}.txt", 'a')
                    file.write("LAST_CURSOR_REACHED"+'\n')
                    file.close()
                    return "NO_NEXT_PAGE"

                ## If has Next Cusor Set Request Cursor = End Cursor
                request_cursor = response_end_cursor

                ## Saves the Cursor into file
                file = open(f"cursors_{location_id}.txt", 'a')
                file.write(str(request_cursor)+'\n')
                file.close()

                # Check For Capacity Flags
                if number_of_post_scrapped >= maximum_post_to_scrap:
                    return "MAX_POST_REACHED"
                if number_of_post_scrapped >= total_posts:
                    return "ALL_POST_SCRAPPED"
                
                number_of_requests = number_of_requests + 1
                print(f'Sleep for {request_sleep_time} Seconds ----')
                time.sleep(request_sleep_time)
                print(f'Sleep Finished, Scrapping next cursor {request_cursor}\n')


def generate_location_url(location_id, cursor=""):
    url = 'https://www.instagram.com/explore/locations/' + str(location_id) + '/?__a=1&max_id=' + str(cursor) 
    return url

def enrich_and_shape_post(post, key_info):
    # Delete unused points
    if 'thumbnail_resources' in post: del post['thumbnail_resources']
    if 'thumbnail_src' in post: del post['thumbnail_src']
    
    # Flatten and Rename
    try:
        try:
            post['caption'] = post['edge_media_to_caption']['edges'][0]['node']['text']
        except:
            post['caption'] = ''
        finally:
            del post['edge_media_to_caption']

        try:
            post['comment_count'] = post['edge_media_to_comment']['count']
        except:
            post['comment_count'] = 0
        finally:
            del post['edge_media_to_comment']

        try:
            post['liked_count'] = post['edge_liked_by']['count']
        except:
            post['liked_count'] = 0
        finally:
            del post['edge_liked_by']
        
        try:
            post['preview_liked_count'] = post['edge_media_preview_like']['count']
        except:
            post['preview_liked_count'] = 0
        finally:
            del post['edge_media_preview_like']

        post['owner_id'] = post['owner']['id']
        del post['owner']

        post['post_height'] = post['dimensions']['height']
        post['post_width'] = post['dimensions']['width']
        del post['dimensions']
    except Exception as e:
        print(e)

    # Merge 2 Dict
    post = post | key_info
    return post

def get_h3_index(lat, lng):
    try:
        return h3.geo_to_h3(
            lat=float(lat),
            lng=float(lng),
            resolution=7
        )
    except Exception as e:
        print(f"Failed to convert H3 {e}")
        return None
