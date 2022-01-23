from charset_normalizer import logging
from instascrape import *
from utils.session import generate_header

def process_by_type(data, type):
    result = []
   
    if (type == 'hashtag') :
        result = process_bulk(data, process_hashtag)
    elif type == 'posts':
        result = process_bulk(data, process_post)
    elif type == 'profiles':
        result = process_bulk(data, process_profile) 
    elif type == 'locations':
        result = process_bulk(data, process_location)                 
    elif type == "reels":
        result = process_bulk(data, process_reel)        
    elif type == "igtv":
        result = process_bulk(data, process_igtv)   

    return result

def process_bulk(data, processor):
    result = []
    for item in data:
        result.append(processor(item))
    return result

def process_hashtag(url):
    temp = Hashtag(url)
    temp.scrape()
    return temp.to_dict()

def process_post(url):
    temp = Post(url)
    temp.scrape()
    return temp.to_dict()

def process_profile(url):
    temp = Profile(url)
    temp.scrape()
    return temp.to_dict()

def process_location(url):
    temp = Location(url)
    header = generate_header()
    if header == False:
        logging.warning("Failed to get data, provide a correct header")
        return None
    temp.scrape(headers=header)
    temp.to_dict()
    return temp

def process_reel(url):
    temp = Reel(url)
    temp.scrape()
    return temp.to_dict()

def process_igtv(url):
    temp = IGTV(url)
    temp.scrape()
    return temp.to_dict()