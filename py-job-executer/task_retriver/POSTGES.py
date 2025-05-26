import asyncio
from utils import *
import json
import asyncpg
import logging

file_handler = logging.FileHandler('logfile.log')
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

db_configs = config['TASK_RETRIVER_PG_CONFIGS']

async def get_connection():
    """Establish a connection to the PostgreSQL database."""
    return await asyncpg.connect(
        user=db_configs['username'],
        password=db_configs['password'],
        host=db_configs['host'],
        port=db_configs['port'],
        database=db_configs['database'],
        server_settings={'search_path': 'core'} 
    )

async def get_tasks_from_db():
    attempt = 0
    while attempt < int(db_configs['reconnect_attempts']):
        conn = None
        try:
            conn = await get_connection()
            async with conn.transaction():
                query = """
                    SELECT *
                    FROM {table_name}
                    WHERE job_status = 'OPEN'
                    AND runtime != 'local'
                    AND runtime = '{runtime}'""".format(table_name=db_configs['table_name'], runtime=EXECUTER_NAME)
                if config['DEFAULT']['use_task_retriver_with_org']=='True':
                    query += """ AND organization IN ({org})""".format(org=db_configs['org'])
                query += """ LIMIT {task_limit}
                    FOR UPDATE SKIP LOCKED""".format(task_limit=db_configs['task_limit'])
                entries = await conn.fetch(query)
                if entries:
                    for entry in entries:
                        entry_id = entry.get("id", "")
                        update_sql = f"UPDATE {db_configs['table_name']} SET job_status = 'QUEUED' WHERE id = {entry_id}"
                        await conn.execute(update_sql)
            if entries:
                await process_job_entries(entries)
            attempt = 0  # Reset attempt counter on success
        except asyncpg.PostgresError as err:
            logger.error('Exception occured: {err}', exc_info=True)
            if isinstance(err, asyncpg.ConnectionDoesNotExistError) or isinstance(err, asyncpg.ConnectionFailureError):
                attempt += 1
                await asyncio.sleep(5)
                continue
            else:
                logger.error('Postgres error occurred', exc_info=True)
                attempt += 1
        except (KeyboardInterrupt, asyncio.CancelledError):
            logger.info(">>>>>>>>Task fetching interrupted. Exiting gracefully.")
        except Exception as e:
            logger.error(f'Exception occurred: {e}', exc_info=True)
        finally:
            if conn:
                await conn.close()  # Ensure the connection is closed
        await asyncio.sleep(int(db_configs['TaskDbCheckInterval']))

async def process_job_entries(entries):
    import app
    try:
        app.create_database()
        logger.info('Created database table')
    except Exception as e:
        logger.error('Error while creating table', exc_info=True)
    for entry in entries:
        try:
            entry_id = entry.get("id", "")
            task_payload = json.loads(entry.get("payload", ""))
            with app.app.app_context():
                task_response = app.create_task_util(task_payload, push_in_queue=False, entry_id=entry_id)
            logger.info(f"For {entry_id}, created task with id: {task_response['task_id']}")
            updated_metadata = get_updated_metadata(entry.get("jobmetadata", ""), task_response['task_id'])
            await update_db(entry_id, 'jobmetadata', updated_metadata)
        except Exception as e:
            logger.error(f'Exception occurred: {e}', exc_info=True)

async def update_db(entry_id, field, value, compare_field="id"):
    attempt = 0
    while attempt < 4:
        conn = None
        try:
            conn = await get_connection()
            async with conn.transaction():
                update_sql = f"UPDATE {db_configs['table_name']} SET {field} = '{value}' WHERE {compare_field} ="
                update_sql += f" {entry_id}" if type(entry_id) == int else f" '{entry_id}'"
                await conn.execute(update_sql)
            if conn:
                await conn.close()
            return
        except asyncpg.PostgresError as err:
            if isinstance(err, asyncpg.ConnectionDoesNotExistError) or isinstance(err, asyncpg.ConnectionFailureError):
                attempt += 1
                await asyncio.sleep(5)
                continue
            else:
                logger.error('Postgres error occurred', exc_info=True)
                break
        except Exception as e:
            logger.error(f'Exception occurred: {e}', exc_info=True)
            break
        finally:
            if conn:
                await conn.close()  # Ensure the connection is closed

def get_updated_metadata(metadata, task_id):
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
        logger.error(f'Exception occurred: {e}', exc_info=True)
        task.cancel()
        loop.stop()
    finally:
        task.cancel()
        loop.close()