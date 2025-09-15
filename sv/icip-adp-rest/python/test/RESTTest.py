import errno
import os
import unittest
from pyhocon import ConfigFactory
from pyspark.sql import SparkSession
from sparkjobserver.api import SparkJob, build_problems, ValidationProblem

from essedum import PythonExecuter
import json
from essedum.Utilities import Utilities

class DummyJob(SparkJob):
    def run_job(self, context, runtime, data):
        return runtime.job_id

    def validate(self, context, runtime, config):
        if config.get('input_string', None):
            return config.get('input_string')
        else:
            return build_problems(['config input.data not found'])

def silentremove(filename):
    try:
        os.remove(filename)
    except OSError as exc:
        if exc.errno != errno.ENOENT:
            raise

class TestSJSApi(unittest.TestCase):

    def setUp(self):
        pwd = os.path.dirname(os.path.realpath(__file__))
        metastore_dir = os.path.abspath(os.path.join(pwd, '..',
                                                     'metastore_db'))
        silentremove(os.path.join(metastore_dir, "dbex.lck"))
        silentremove(os.path.join(metastore_dir, "db.lck"))
        self.sc = SparkSession.builder.master("local").appName("TestApp").getOrCreate()


    def tearDown(self):
        self.sc.stop()

    def test_validation_failure(self):
        print("Line 5")
        job = PythonExecuter()
        result = job.validate(self.sc, None, ConfigFactory.parse_string(""))
        self.assertTrue(isinstance(result, list))
        self.assertEqual(1, len(result))
        self.assertTrue(isinstance(result[0], ValidationProblem))

    def test_validation_success(self):
        print("Line 6")
        job = PythonExecuter()
        result = job.validate(
                self.sc,
                None,
                ConfigFactory.parse_string('{"input_string" : ["a", "a", "b"]}'))
        self.assertEqual(result, ['a', 'a', 'b'])

    def test_run_job(self):
        print("Line 1")
        with open('D:/pythoncod/August/icip-spark-plugin-python-core/icip-python-plugin/tests/resources/REST.txt',
                  'r') as file:
            data = file.read().replace('\n', '')
        print(data)
        job = PythonExecuter()
        job_data = job.validate(
            None,
            self.sc,
            ConfigFactory.parse_string('{"input_string":' + data + '}'))
        print("Line 2")
        result = job.run_job(self.sc, None, job_data)
        print(result)





if __name__ == "__main__":
    unittest.main()
