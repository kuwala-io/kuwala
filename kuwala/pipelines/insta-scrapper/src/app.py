from quart import Quart
from routes.hashtag import hashtag
from routes.posts import posts
from routes.profiles import profiles
from routes.locations import locations
from routes.reels import reels
from routes.igtv import igtv

app = Quart(__name__)
app.register_blueprint(hashtag)
app.register_blueprint(posts)
app.register_blueprint(profiles)
app.register_blueprint(locations)
app.register_blueprint(reels)
app.register_blueprint(igtv)

@app.route('/')
async def hello():
    return 'Running Insta Scrapper API on 3016'

app.run(host='0.0.0.0', port=3016)