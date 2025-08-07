import sqlite3
from threading import local
import datetime
from zoneinfo import ZoneInfo
import os
from utils import *
import logging

# Gets or creates a logger
logger = logging.getLogger(__name__)  

# set log level
logger.setLevel(logging.INFO)

# define file handler and set formatter
file_handler = logging.FileHandler('logfile.log')
formatter    = logging.Formatter('%(asctime)s : %(levelname)s : %(name)s : %(message)s')
file_handler.setFormatter(formatter)

# add file handler to logger
logger.addHandler(file_handler)


class JobNF(Exception):
    pass

class DatabaseOperations:
    def __init__(self):
        self.thread_local = local()

    def get_db(self):
        """Get a thread-local database connection."""
        if not hasattr(self.thread_local, 'connection'):
            try:
                self.thread_local.connection = sqlite3.connect('/data/app.db', isolation_level=None)
                self.thread_local.connection.execute('PRAGMA journal_mode = WAL')
                self.thread_local.connection.execute('PRAGMA wal_checkpoint(FULL)')
            except Exception as e:
                logger.error('Exception occured', exc_info=True)
        return self.thread_local.connection

    def create_database(self):
        """Create the database and tables if they don't exist."""
        data_dir = '/data'
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)

        with sqlite3.connect('/data/app.db', isolation_level=None) as db:
            db.execute('BEGIN')
            try:
                # Perform your delete operation here
                db.execute('''CREATE TABLE IF NOT EXISTS jobs
                    (id INT PRIMARY KEY     NOT NULL,
                    status  varchar(50)  ,
                    logpath varchar(255),
                    submitted Datetime,
                    started Datetime,
                    finished Datetime,
                    pid varchar(50));
                    ''')
                db.execute('COMMIT')
                logger.info("Table created successfully")
            except Exception as e:
                db.execute('ROLLBACK')
                logger.error('Exception occured', exc_info=True)
                raise e

    def close_connection(self):
        """Close the database connection."""
        if hasattr(self.thread_local, 'connection'):
            self.thread_local.connection.close()
            del self.thread_local.connection

    def execute_query(self, query, params=None, fetchall=False):
        """Execute a database query with thread safety."""
        result = []
        try:
            with self.get_db() as db:
                cursor = db.cursor()
                cursor.execute(query)
                if fetchall:
                    result = cursor.fetchall()
                else:
                    result = cursor.fetchone()
                return result
        except Exception as e:
            logger.error('Exception occured', exc_info=True)
            return result

    def get_jobs(self, limit=100):
        query = "SELECT id,pid,status,logpath,submitted,started,finished from jobs order by submitted desc LIMIT {0}".format(limit)
        result = self.execute_query(query=query, params=None, fetchall=True)
        jobs = []
        for row in result:
            jobs.append({"id": row[0], "pid": row[1], "status": row[2], "logpath": row[3], "submitted": row[4],
                        "started": row[5], "finished":row[6]})
        return jobs
    
    def get_jobs_id(self, limit=100):
        query = "SELECT id,pid,status,submitted from jobs order by submitted desc LIMIT {0}".format(limit)
        result = self.execute_query(query=query, params=None, fetchall=True)
        jobs_id = []
        for row in result:
            jobs_id.append({"id": row[0], "pid": row[1], "status": row[2], "submitted": row[3]})
        return jobs_id
    
    def get_job_by_id(self, job_id):
        query = "SELECT id,pid,status,logpath,submitted,started,finished from jobs where id = '{}'".format(job_id)
        result = self.execute_query(query=query, params=None, fetchall=True)
        jobs = []
        for row in result:
            jobs.append({"id": row[0], "pid": row[1], "status": row[2], "logpath": row[3], "submitted": row[4],
                        "started": row[5], "finished": row[6]})
            
        if len(jobs)>0:
            return jobs[0]
        else:
            raise JobNF

    def create_job(self, job):
        """Create data in the database."""
        with self.get_db() as db:
            db.execute('BEGIN')
            try:
                # Perform your create operation here
                db.execute("INSERT INTO jobs (id, status, logpath, submitted) VALUES ( '{0}', '{1}', '{2}', '{3}' )".format(job.id, job.status, job.log_path, datetime.datetime.now(tz=ZoneInfo('Asia/Kolkata'))))
                db.execute('COMMIT')
                logger.info("Record created successfully")
            except Exception as e:
                db.execute('ROLLBACK')
                logger.error('Exception occured', exc_info=True)
                raise e
            

    def update_job_status(self, job_id, status ):
        """Update the status of a service in the database."""
        with self.get_db() as db:
            db.execute('BEGIN')
            try:
                # Perform your update operation here
                db.execute("Update jobs set status = '{0}' where id = '{1}'".format(status, job_id))
                db.execute('COMMIT')
            except Exception as e:
                db.execute('ROLLBACK')
                logger.error('Exception occured', exc_info=True)
                raise e
    def update_job_start_time(self, job_id):
        """Update the status of a service in the database."""
        with self.get_db() as db:
            db.execute('BEGIN')
            try:
                # Perform your update operation here
                db.execute("Update jobs set started = '{0}' where id = '{1}'".format(datetime.datetime.now(tz=ZoneInfo('Asia/Kolkata')), job_id))
                db.execute('COMMIT')
            except Exception as e:
                db.execute('ROLLBACK')
                logger.error('Exception occured', exc_info=True)
                raise e
    def update_job_finish_time(self, job_id):
        """Update the status of a service in the database."""
        with self.get_db() as db:
            db.execute('BEGIN')
            try:
                # Perform your update operation here
                db.execute("Update jobs set finished = '{0}' where id = '{1}'".format(datetime.datetime.now(tz=ZoneInfo('Asia/Kolkata')), job_id))
                db.execute('COMMIT')
            except Exception as e:
                db.execute('ROLLBACK')
                logger.error('Exception occured', exc_info=True)
                raise e
            
    def update_job_pid(self, job_id, pid):
        """Update the status of a service in the database."""
        with self.get_db() as db:
            db.execute('BEGIN')
            try:
                # Perform your update operation here
                db.execute("Update jobs set pid = '{0}' where id = '{1}'".format(pid, job_id))
                db.execute('COMMIT')
            except Exception as e:
                db.execute('ROLLBACK')
                logger.error('Exception occured', exc_info=True)
                raise e
            
    def clean_jobs_table(self):
        with sqlite3.connect('/data/app.db', isolation_level=None) as db:
            db.execute('BEGIN')
            try:
                # Perform your delete operation here
                db.execute("Delete from jobs")
                db.execute('COMMIT')
                logger.info("Db cleaned up successfully")
            except Exception as e:
                db.execute('ROLLBACK')
                logger.error('Exception occured', exc_info=True)
                raise e

