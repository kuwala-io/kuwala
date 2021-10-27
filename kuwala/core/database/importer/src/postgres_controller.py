import logging

import psycopg2


def create_tables(database_host, database_name, database_user, database_password):
    db = None
    # noinspection PyBroadException
    try:
        db = psycopg2.connect(host=database_host, database=database_name, user=database_user, password=database_password)
        cursor = db.cursor()

        with open('../sql/create_tables.sql', 'r') as f:
            query = f.read()

            cursor.execute(query)
            f.close()

        cursor.close()
        db.commit()
    except Exception as error:
        logging.error(error)
    finally:
        if db is not None:
            db.close()
