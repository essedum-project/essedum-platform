import httpx
import logging
import json
from typing import List, Dict, Any
import mysql.connector
from fastmcp import FastMCP # Import the framework
from config_loader import get_mysql_config

# --- CONFIGURATION ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MySQL Configuration
MYSQL_CONFIG = get_mysql_config()

mcp = FastMCP(
    name="MySQL Tool Server"
)

# @mcp.tool
def get_weather(city: str) -> str:
    """
    Fetches the current weather for a specific city.

    Args:
        city: The name of the city (e.g., "London", "Tokyo").

    Returns:
        A string describing the weather or an error message.
    """
    # This is *your* custom logic. It only runs when Langflow's
    # agent decides to call this tool via an HTTP POST request.
    logger.info(f"Tool 'get_weather' called with city: {city}")
    try:
        response = httpx.get(f"https://wttr.in/{city}?format=%C+%t")
        response.raise_for_status()
        weather_data = response.text.strip()
        logger.info(f"API response: {weather_data}")
        return f"The weather in {city} is {weather_data}."

    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        return "Sorry, an unexpected error occurred."

# --- MYSQL DATABASE TOOLS ---
def execute_mysql_query(query: str) -> List[Dict[str, Any]]:
    """Execute MySQL query and return results"""
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query)
        
        if query.strip().lower().startswith(('select', 'show', 'describe', 'explain')):
            result = cursor.fetchall()
        else:
            conn.commit()
            result = [{"affected_rows": cursor.rowcount, "message": "Query executed successfully"}]
        
        cursor.close()
        conn.close()
        
        logger.info(f"Query executed successfully: {len(result) if isinstance(result, list) else 1} rows affected")
        return result
        
    except mysql.connector.Error as e:
        logger.error(f"MySQL error: {e}")
        return [{"error": f"Database error: {e}"}]
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return [{"error": f"Server error: {e}"}]

@mcp.tool
def mysql_query(query: str) -> str:
    """
    Execute SQL queries against the MySQL database.

    Args:
        query: SQL query to execute (SELECT, INSERT, UPDATE, DELETE, etc.)

    Returns:
        JSON string with query results or error message.
    """
    logger.info(f"Tool 'mysql_query' called with query: {query}")
    result = execute_mysql_query(query)
    return json.dumps(result, default=str, indent=2)

@mcp.tool
def get_tables() -> str:
    """
    Get list of tables in the database.

    Returns:
        JSON string with list of tables in the database.
    """
    logger.info("Tool 'get_tables' called")
    result = execute_mysql_query("SHOW TABLES")
    return json.dumps(result, default=str, indent=2)

@mcp.tool
def describe_table(table_name: str) -> str:
    """
    Get table structure and column information.

    Args:
        table_name: Name of the table to describe

    Returns:
        JSON string with table structure information.
    """
    logger.info(f"Tool 'describe_table' called with table_name: {table_name}")
    result = execute_mysql_query(f"DESCRIBE {table_name}")
    return json.dumps(result, default=str, indent=2)

if __name__ == "__main__":
    print("🚀 Starting MCP server with MySQL tools")
    print(f"   Server: http://0.0.0.0:8000")
    print(f"   Database: {MYSQL_CONFIG['host']}:{MYSQL_CONFIG['port']}/{MYSQL_CONFIG['database']}")
    print("   Tools: mysql_query, get_tables, describe_table")
    print("🚀 Ready for Langflow integration!")

    mcp.run(transport="sse", host="0.0.0.0", port=8000 )
