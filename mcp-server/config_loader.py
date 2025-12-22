import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv('mcp_config.env')

def get_mysql_config():
    """Get MySQL configuration from environment variables"""
    return {
        'host': os.getenv('MYSQL_HOST', 'mysql-local'),
        'port': int(os.getenv('MYSQL_PORT', 3306)),
        'user': os.getenv('MYSQL_USER', 'root'),
        'password': os.getenv('MYSQL_PASSWORD', 'password'),
        'database': os.getenv('MYSQL_DATABASE', 'essedum_coredb')
    }
