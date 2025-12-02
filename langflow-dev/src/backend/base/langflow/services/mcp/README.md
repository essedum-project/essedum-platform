# MySQL MCP Server for Langflow

This directory contains the MySQL Model Context Protocol (MCP) server integration for Langflow, enabling direct database communication through Langflow's MCP Tools component.

## Overview

The MySQL MCP server provides tools for:
- Executing SQL queries against a MySQL database
- Getting list of tables in the database
- Describing table structures and columns
- Performing CRUD operations on database records

## Files Structure

```
mysql_mcp_server.py           # Main MCP server implementation
mysql_mcp_service.py          # Langflow service integration
mysql_mcp_integration.py      # Registration utilities
mysql_mcp_config.json         # Server configuration
config_loader.py              # Environment-based configuration loader
mcp_config.env               # Configuration file with environment variables
requirements.txt             # Python dependencies
README.md                    # This documentation
__init__.py                  # Python package file
```

## Quick Start

### 1. Configure Database Connection

Edit `mcp_config.env` with your database settings:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database

# MCP Server Configuration
MCP_SERVER_HOST=127.0.0.1
MCP_SERVER_PORT=5555
```

### 2. Start the Server

```bash
# Navigate to the MCP directory
cd src/backend/base/langflow/services/mcp

# Start the server
python mysql_mcp_server.py
```

### 3. Use in Langflow

1. Add an **MCP Tools** component to your flow
2. Select **mysql_database_server** from the dropdown
3. Choose from available tools: `mysql_query`, `get_tables`, `describe_table`

## Configuration

The server uses environment-based configuration for maximum flexibility:

### Quick Configuration
Edit `mcp_config.env` with your settings:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database

# MCP Server Configuration
MCP_SERVER_HOST=127.0.0.1
MCP_SERVER_PORT=5555
MCP_SERVER_URL=http://127.0.0.1:5555/mcp/sse
MCP_SERVER_NAME=mysql_database_server
MCP_SERVER_DESCRIPTION=MySQL database MCP server for local database communication
```

### Environment Variable Override
You can override any setting using environment variables:

```powershell
# Windows PowerShell
$env:MYSQL_HOST="production-db.com"
$env:MCP_SERVER_PORT="8080"
python mysql_mcp_server.py
```

### Configuration Priority
1. Environment variables (highest)
2. `mcp_config.env` file
3. Default values (lowest)

## Available Tools

### `mysql_query`
Execute SQL queries against the MySQL database.
- **Parameter**: `query` (string) - SQL query to execute

### `get_tables`
Get a list of all tables in the database.
- **Parameters**: None

### `describe_table`
Get detailed information about a table's structure.
- **Parameter**: `table_name` (string) - Name of the table to describe

## Usage Examples

**Get Tables:**
```json
{"tool": "get_tables"}
```

**Execute Query:**
```json
{
  "tool": "mysql_query",
  "arguments": {"query": "SELECT * FROM users LIMIT 10"}
}
```

**Describe Table:**
```json
{
  "tool": "describe_table",
  "arguments": {"table_name": "users"}
}
```

## Server Endpoints

- `GET /health` - Health check endpoint
- `GET /mcp/sse` - Server-Sent Events endpoint for MCP communication
- `POST /mcp/sse` - Handle MCP method calls
- `GET /mcp/tools` - Get available tools list

## Environment Configuration

You can override any configuration using environment variables:

```powershell
# Windows PowerShell
$env:MYSQL_HOST="production-db.com"
$env:MCP_SERVER_PORT="8080"
python mysql_mcp_server.py
```

## Dependencies

Install required dependencies:
```bash
pip install -r requirements.txt
```

Core dependencies: `fastapi`, `uvicorn`, `mysql-connector-python`, `aiohttp`, `pydantic`

## Troubleshooting

### Common Issues
1. **Database Connection Failed**: Check credentials in `mcp_config.env`
2. **Server Not Found**: Restart Langflow, verify server runs on configured port  
3. **Query Errors**: Validate SQL syntax and database permissions

### Health Check
Test server status: `curl http://127.0.0.1:5555/health`

### Configuration Test
Verify your settings by running the server and checking the startup output for configuration values.