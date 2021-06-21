def get_nested_value(array, *argv):
    """Check if an index exists in the array and return the corresponding value
    :param array array: the data array
    :param int argv: index integers
    :return: None if not available or the return value
    """

    try:
        for index in argv:
            array = array[index]

        return array
    except (IndexError, TypeError):
        return None
