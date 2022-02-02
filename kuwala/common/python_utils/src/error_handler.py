from quart import jsonify


def general_error(error):
    return (
        jsonify({"success": False, "error": {"message": error.description}}),
        error.status_code,
    )
