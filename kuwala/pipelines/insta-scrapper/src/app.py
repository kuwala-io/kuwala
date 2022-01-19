from quart import Quart
from routes.hashtag import hashtag

app = Quart(__name__)
app.register_blueprint(hashtag)

@app.route('/')
async def hello():
    return 'hello'

app.run(host='0.0.0.0', port='3016')