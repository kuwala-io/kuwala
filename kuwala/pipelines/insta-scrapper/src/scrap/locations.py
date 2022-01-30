from pkg_resources import ResolutionError
from torpy.http.requests import TorRequests, tor_requests_session
from tqdm import tqdm
import json
import utils
import time
import pandas as pd
import h3

def scrape_location(location_id, cursor =""):
    headers = {}
    headers['User-agent'] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"
    log_error = True

    with TorRequests() as tor_requests:
        with tor_requests.get_session() as sess:
            print(f"Cirtcuit Created with Relay : {utils.get_relay_address(sess)}")
            
            try:
                request_url = generate_location_url(location_id, cursor)
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
                        file.write(f'REQUESTS URL \t\t:\t{generate_location_url(location_id, cursor)}\n')
                        file.write(f'ERROR CAUSE \t\t:\t{e}\n')
                        file.write(f'TIMESTAMP \t\t\t:\t{time.time()}\n\n')
                        file.write(format(response.text))
                        file.close()
                except:
                    print("Unknown Error / Tor End Node Blocked")
                return False # go back to main loop and get next session
 
            # Process data when it is successfully fetched

            ## Determine if result is valid
            if result['graphql']['location'] == None:
                print("No data to scrap")
                return "no data to scrap"

            ## Get Data Points
            data = result['graphql']['location']['edge_location_to_media']
            location_info = result['graphql']['location']
            total_posts = data['count']
            node_list = data['edges']

            ## Get Key Information
            ## Such as : Location name, Lat, Long, H3 Index
            h3_index = get_h3_index(location_info['lat'], location_info['lng'])
            key_info = {
                'location_name': location_info['name'],
                'lat': location_info['lat'],
                'long': location_info['lng'],
                'h3': str(h3_index),
            }

            ## Enrich & Shape data
            posts = [enrich_and_shape_post(i["node"], key_info) for i in node_list]

            ## Load Data 
            pf = pd.json_normalize(posts)
            file_name = f"{location_id}.csv"
            pf.to_csv(file_name, index=False)
            return True


def generate_location_url(location_id, cursor=""):
    url = 'https://www.instagram.com/explore/locations/' + str(location_id) + '/?__a=1&max_id=' + str(cursor) 
    return url

def enrich_and_shape_post(post, key_info):
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
