from instascrape import *

def process_by_type(data, type):
    result = []

    if (type == 'hashtag') :
        result = process_bulk(data, process_hashtag)
    elif type == 'posts':
        result = process_bulk(data, process_post)
    elif type == 'profiles':
        result = process_bulk(data, process_profile) 
    elif type == 'locations':
        result = process_bulk(data, process_locations)                      
    
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

def process_locations(url):
    temp = Location(url)
    temp.scrape()
    return temp.to_dict()