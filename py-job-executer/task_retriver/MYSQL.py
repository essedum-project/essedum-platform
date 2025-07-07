import asyncio
from utils import *
import json
import mysql.connector
import logging
from dotenv import load_dotenv

file_handler = logging.FileHandler('logfile.log')
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

db_configs = config['TASK_RETRIVER_MYSQL_CONFIGS']
def getConnection():
    username = db_configs['username']
    password = os.getenv("mysql_db_password")
    host = db_configs['host']
    port = db_configs['port']
    database = db_configs['database']
    connection = mysql.connector.connect(user=username, password=password, host=host, database=database, port=port)
    return connection

async def get_tasks_from_db():
    attempt = 0
    while attempt < int(db_configs['reconnect_attempts']):
        try:
            mydb = getConnection()
            mycursor = mydb.cursor(dictionary=True)
            query = """
                SELECT *
                FROM {table_name}
                WHERE job_status = 'OPEN'
                AND runtime != 'local'
                AND runtime = '{runtime}'
            """.format(table_name=db_configs['table_name'],runtime = EXECUTER_NAME)
            if config['DEFAULT']['use_task_retriver_with_org']=='True':
                    query += """ AND organization IN ({org})""".format(org=db_configs['org'])
            query += """ LIMIT {task_limit}
                FOR UPDATE SKIP LOCKED""".format(task_limit=db_configs['task_limit'])
            mycursor.execute(query)
            entries = mycursor.fetchall()
            if entries:
                for entry in entries:
                    entry_id = entry.get("id", "")
                    update_sql = f"UPDATE {db_configs['table_name']} SET job_status = 'QUEUED' WHERE id = {entry_id}"
                    mycursor.execute(update_sql)
                    mydb.commit()
                await process_job_entries(entries)
            attempt = 0
            mydb.commit()
        except mysql.connector.Error as err:
            logger.error(f'Exception occured: {err}', exc_info=True)
            if err.errno in (2006, 2013):
                attempt+=1
                await asyncio.sleep(5)
                continue
            else:
                if mydb and mydb.is_connected():
                    mydb.rollback()
                attempt+=1
        except (KeyboardInterrupt, asyncio.CancelledError) as e:
            logger.error('Exception occured: {e}', exc_info=True)
        except Exception as e:
            logger.error('Exception occured: {e}', exc_info=True)
        finally:
            if mydb and mydb.is_connected():
                mydb.rollback()
                mycursor.close()
                mydb.close()
        await asyncio.sleep(int(db_configs['TaskDbCheckInterval']))

async def process_job_entries(entries):
    import app
    try:
        app.create_database()
        logger.info('created data base table')
    except Exception as e:
        logger.error('Error while creating table', exc_info=True)
    for entry in entries:
        try:
            entry_id = entry.get("id", "")
            task_payload = json.loads(entry.get("payload", ""))
            with app.app.app_context():
                task_response = app.create_task_util(task_payload, push_in_queue = False, entry_id = entry_id)
            logger.info(f"for {entry_id} created task with id: {task_response['task_id']}")
            updated_metadata = get_updated_metadata(entry.get("jobmetadata", ""), task_response['task_id'])
            await update_db(entry_id, 'jobmetadata', updated_metadata)
        except Exception as e:
            logger.error('Exception occured {e}', exc_info=True)

async def update_db(entry_id, field, value, compare_field="id"):
    attempt = 0
    while attempt < 4:
        try:
            mydb = getConnection()
            mycursor = mydb.cursor()
            update_sql = f"UPDATE {db_configs['table_name']} SET {field} = '{value}' WHERE {compare_field} ="
            update_sql += f" {entry_id}" if type(entry_id) == int else f" '{entry_id}'"
            mycursor.execute(update_sql)
            mydb.commit()
            return
        except mysql.connector.Error as err:
            if err.errno in (2006, 2013):
                attempt += 1
                await asyncio.sleep(5)
                continue
            else:
                mydb.rollback()
                break
        except Exception as e:
            logger.error('Exception occured {e}', exc_info=True)
            mydb.rollback()
            break
        finally:
            if mydb and mydb.is_connected():
                mydb.rollback()
                mycursor.close()
                mydb.close()

def get_updated_metadata(metadata,task_id):
    metadata = json.loads(metadata)
    metadata['taskId'] = task_id
    updated_metadata = json.dumps(metadata)
    return updated_metadata


def start_fetch_tasks():
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        task = loop.create_task(get_tasks_from_db())
        loop.run_until_complete(task)
    except KeyboardInterrupt or Exception as e:
        logger.error('Exception occured {e}', exc_info=True)
        task.cancel()
        loop.stop()
    finally:
        task.cancel()
        loop.close()