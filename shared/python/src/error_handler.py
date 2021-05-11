from quart import jsonify


def bad_request(error):
    return jsonify({
        'success': False,
        'error': {
            'message': error.description
        }
    }), error.status_code
