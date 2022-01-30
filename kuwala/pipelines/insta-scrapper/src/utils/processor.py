from venv import create
from instascrape import *
from utils.session import create_proxy_session

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
        session = create_proxy_session()
        result.append(processor(item, session))
    return result

def process_hashtag(url, session):
    temp = Hashtag(url)
    temp.scrape(session=session)
    return temp.to_dict()

def process_post(url, session):
    temp = Post(url)
    temp.scrape(session=session)
    return temp.to_dict()

def process_profile(url, session):
    temp = Profile(url)
    temp.scrape(session=session)
    return temp.to_dict()

def process_location(url, session):
    temp = Location(url)
    temp.scrape(session=session)
    temp.to_dict()
    return temp

def process_reel(url, session):
    temp = Reel(url)
    temp.scrape(session=session)
    return temp.to_dict()

def process_igtv(url, session):
    temp = IGTV(url)
    temp.scrape(session=session)
    return temp.to_dict()