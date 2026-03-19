# Langflow with PostgreSQL (Persistent Data)

Production-ready Langflow setup using PostgreSQL for persistent data storage on ARM64 (Cavium ThunderX).

## Overview

This setup uses:
- **Langflow:** Version 1.1.2 (ARM64 compatible)
- **Database:** PostgreSQL 16 (external, shared container)
- **Port:** 7866 (different from dev setup on 7865)
- **Data Persistence:** PostgreSQL database + local cache
- **Network:** Connected to existing PostgreSQL via `march16_default` network

## Key Differences from langflow-dev-base

| Feature | langflow-dev-base | langflow-persistent |
|---------|-------------------|---------------------|
| **Database** | SQLite (file-based) | PostgreSQL (server-based) |
| **Port** | 7865 | 7866 |
| **Container Name** | `langflow` | `langflow-persistent` |
| **Data Loss Risk** | High (volume removal) | Low (separate DB server) |
| **Concurrency** | Single user | Multi-user capable |
| **Use Case** | Development/testing | Production/persistent |

## Prerequisites

- Docker and Docker Compose installed
- ARM64 Linux system
- **PostgreSQL container must be running:** `langflow-postgres`
- Port 7866 available
- Access to `march16_default` network

## System Information

- **Platform:** Linux ARM64 (aarch64)
- **CPU:** Cavium ThunderX ARMv8.0 (part 0x0a1)
- **Docker Image:** `langflowai/langflow:1.1.2`
- **Container Name:** `langflow-persistent`
- **PostgreSQL Host:** `langflow-postgres`
- **Database:** `langflow_persistent`
- **Base Directory:** `/home/mamindla/langflow-persistent`

## Quick Start

### 1. Verify PostgreSQL is Running
```bash
docker ps --filter name=langflow-postgres
# Should show: langflow-postgres running on port 5434
```

### 2. Create Database
The database is automatically created on first start, but you can create it manually:
```bash
docker exec -it langflow-postgres psql -U langflow_user -d langflowdb -c \
  "CREATE DATABASE langflow_persistent;"
```

### 3. Start Langflow
```bash
cd /home/mamindla/langflow-persistent
docker compose up -d
```

### 4. Access Langflow
- **Local:** http://localhost:7866
- **Network:** http://10.200.111.174:7866

### 5. Verify Database Connection
```bash
docker logs langflow-persistent | grep -i "database\|postgres"
```

## Management Commands

### Start Langflow
```bash
docker compose up -d
```

### Stop Langflow
```bash
docker compose down
```

### Restart Langflow
```bash
docker compose restart langflow
```

### View Logs
```bash
# Live logs
docker compose logs -f

# Recent logs
docker compose logs --tail 100

# Logs with timestamps
docker compose logs -f --timestamps
```

### Check Status
```bash
docker compose ps
docker stats langflow-persistent --no-stream
```

### Access Container Shell
```bash
docker exec -it langflow-persistent /bin/sh
```

## PostgreSQL Connection

### Connection Details
```yaml
Host: langflow-postgres (container) or localhost:5434 (host)
Port: 5432 (internal) / 5434 (host)
Database: langflow_persistent
User: langflow_user
Password: langflow_pass
```

### Connection String
```
postgresql://langflow_user:langflow_pass@langflow-postgres:5432/langflow_persistent
```

### Access Database Directly
```bash
# From host
docker exec -it langflow-postgres psql -U langflow_user -d langflow_persistent

# Check tables
docker exec -it langflow-postgres psql -U langflow_user -d langflow_persistent -c '\dt'

# Check data size
docker exec -it langflow-postgres psql -U langflow_user -d langflow_persistent -c \
  "SELECT pg_size_pretty(pg_database_size('langflow_persistent'));"
```

## Data Persistence

### What is Persistent?
✅ **Fully Persistent (in PostgreSQL):**
- User flows
- Components
- API keys
- User settings
- Session data

✅ **Cached Locally:**
- File cache in `./data/cache/`
- Temporary files

### Data Survival
| Action | SQLite (dev) | PostgreSQL (persistent) |
|--------|--------------|-------------------------|
| `docker compose restart` | ✅ Kept | ✅ Kept |
| `docker compose down` | ✅ Kept | ✅ Kept |
| `docker compose down -v` | ❌ LOST | ✅ Kept (DB separate) |
| Delete `./data` folder | ❌ LOST | ✅ Kept (DB separate) |
| Remove container | ❌ LOST | ✅ Kept (DB separate) |
| PostgreSQL restart | N/A | ✅ Kept |

## Backup and Restore

### Backup Database
```bash
# Backup PostgreSQL database
docker exec langflow-postgres pg_dump -U langflow_user langflow_persistent > \
  langflow-persistent-backup-$(date +%Y%m%d-%H%M%S).sql

# Check backup size
ls -lh langflow-persistent-backup-*.sql
```

### Backup Cache and Files
```bash
# Backup local cache/data
tar -czf langflow-cache-backup-$(date +%Y%m%d).tar.gz data/
```

### Restore Database
```bash
# Stop Langflow first
docker compose down

# Restore database
cat langflow-persistent-backup-YYYYMMDD-HHMMSS.sql | \
  docker exec -i langflow-postgres psql -U langflow_user langflow_persistent

# Start Langflow
docker compose up -d
```

### Full Backup (Database + Files)
```bash
#!/bin/bash
BACKUP_DIR="/backup/langflow-persistent"
mkdir -p "$BACKUP_DIR"
DATE=$(date +%Y%m%d-%H%M%S)

# Backup database
docker exec langflow-postgres pg_dump -U langflow_user langflow_persistent > \
  "$BACKUP_DIR/database-$DATE.sql"

# Backup local files
tar -czf "$BACKUP_DIR/data-$DATE.tar.gz" -C /home/mamindla/langflow-persistent data/

echo "Backup complete:"
ls -lh "$BACKUP_DIR/"*$DATE*
```

## Container Configuration

### Docker Compose Structure
```yaml
services:
  langflow:
    - Uses langflowai/langflow:1.1.2 (ARM64)
    - Connects to existing PostgreSQL
    - Port 7866 (to avoid conflict with port 7865)
    - Joins march16_default network
  
  postgres-init:
    - One-time initialization container
    - Creates langflow_persistent database
    - Exits after setup completes
```

### Environment Variables
```bash
LANGFLOW_HOST=0.0.0.0
LANGFLOW_PORT=7866
LANGFLOW_DATABASE_URL=postgresql://langflow_user:langflow_pass@langflow-postgres:5432/langflow_persistent
LANGFLOW_LOG_LEVEL=info
LANGFLOW_CACHE_DIR=/app/data/cache
```

### Network Configuration
- **Network:** `march16_default` (external, shared with PostgreSQL)
- **Container Name:** `langflow-persistent`
- **Hostname:** `langflow-persistent` (resolvable within network)

## Monitoring

### Check Database Connection
```bash
# From Langflow container
docker exec langflow-persistent env | grep DATABASE

# Test connection
docker exec langflow-persistent sh -c \
  'python -c "import psycopg2; conn = psycopg2.connect(\"postgresql://langflow_user:langflow_pass@langflow-postgres:5432/langflow_persistent\"); print(\"✓ Connected\")"'
```

### Monitor PostgreSQL Activity
```bash
# Active connections from Langflow
docker exec langflow-postgres psql -U langflow_user -d langflow_persistent -c \
  "SELECT application_name, client_addr, state, query_start 
   FROM pg_stat_activity 
   WHERE datname='langflow_persistent';"
```

### Resource Usage
```bash
# Container resources
docker stats langflow-persistent --no-stream

# Database size
docker exec langflow-postgres psql -U langflow_user -d langflow_persistent -c \
  "SELECT 
    pg_size_pretty(pg_database_size('langflow_persistent')) as db_size,
    pg_size_pretty(pg_total_relation_size('public.flow')) as flow_table_size;" \
  2>/dev/null || echo "Tables not yet created"

# Disk usage
du -sh ./data
```

## Troubleshooting

### Container Won't Start
```bash
# Check PostgreSQL is running
docker ps --filter name=langflow-postgres

# Check network exists
docker network ls | grep march16_default

# Check logs
docker compose logs

# Verify database exists
docker exec langflow-postgres psql -U langflow_user -d langflowdb -c '\l' | grep langflow_persistent
```

### Database Connection Failed
```bash
# Test connectivity from container
docker run --rm --network march16_default postgres:16-alpine \
  pg_isready -h langflow-postgres -U langflow_user

# Test full connection
docker run --rm --network march16_default postgres:16-alpine \
  psql postgresql://langflow_user:langflow_pass@langflow-postgres:5432/langflow_persistent -c '\l'

# Check credentials in environment
docker exec langflow-persistent env | grep -i postgres
```

### Database Locked or Slow
```sql
-- Check for long-running queries (run in PostgreSQL)
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE state != 'idle' AND datname = 'langflow_persistent'
ORDER BY duration DESC;

-- Terminate specific query (careful!)
SELECT pg_terminate_backend(pid);

-- Vacuum database
VACUUM ANALYZE;
```

### "Database already exists" Error
This is normal on restart - the init container tries to create the database but it already exists. Safe to ignore.

### Port 7866 Already in Use
```bash
# Check what's using the port
sudo lsof -i :7866
sudo netstat -tlnp | grep 7866

# Change port in docker-compose.yml if needed
# ports:
#   - "7867:7866"
```

### Migration from SQLite Version
If you have data in the SQLite version (langflow-dev-base):

**Option 1: Export/Import via UI** (Recommended)
1. Access SQLite version: http://localhost:7865
2. Export your flows (Download JSON)
3. Access PostgreSQL version: http://localhost:7866
4. Import flows (Upload JSON)

**Option 2: Database Migration** (Advanced)
- Would require custom migration scripts
- Not officially supported by Langflow
- Not recommended

## Advanced Configuration

### Custom Database Name
Edit `docker-compose.yml`:
```yaml
environment:
  - LANGFLOW_DATABASE_URL=postgresql://langflow_user:langflow_pass@langflow-postgres:5432/my_custom_db
```

Then create the database:
```bash
docker exec langflow-postgres psql -U langflow_user -d langflowdb -c \
  "CREATE DATABASE my_custom_db;"
```

### Connection Pooling
For high-traffic scenarios, add to connection string:
```
postgresql://langflow_user:langflow_pass@langflow-postgres:5432/langflow_persistent?pool_size=20&max_overflow=10
```

### Resource Limits
Add to `docker-compose.yml`:
```yaml
services:
  langflow:
    # ... existing config ...
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 512M
```

### Health Checks
Add to `docker-compose.yml`:
```yaml
services:
  langflow:
    # ... existing config ...
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7866/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Security Considerations

### Production Recommendations
1. **Change default password:**
   ```bash
   # Update in .env and docker-compose.yml
   # Then update PostgreSQL password:
   docker exec langflow-postgres psql -U langflow_user -d langflowdb -c \
     "ALTER USER langflow_user WITH PASSWORD 'new_secure_password';"
   ```

2. **Use secrets instead of plain text:**
   ```yaml
   # docker-compose.yml
   secrets:
     db_password:
       file: ./secrets/db_password.txt
   
   services:
     langflow:
       secrets:
         - db_password
   ```

3. **Restrict network access:**
   ```yaml
   # Bind to localhost only
   ports:
     - "127.0.0.1:7866:7866"
   ```

4. **Enable SSL for PostgreSQL:**
   - Configure PostgreSQL to require SSL connections
   - Update connection string: `?sslmode=require`

5. **Regular backups:**
   - Automated daily/weekly backups
   - Test restore procedures
   - Store backups off-server

## File Structure

```
langflow-persistent/
├── docker-compose.yml      # Service definition with PostgreSQL
├── .env                    # Environment variables (connection details)
├── Dockerfile             # Not used (prebuilt image)
├── README.md             # This file
└── data/                 # Local cache only (not database)
    └── cache/            # Application cache
```

## Maintenance

### Daily Checks
```bash
# Verify running
docker compose ps

# Check logs for errors
docker compose logs --tail 50 | grep -i error

# Check database size
docker exec langflow-postgres psql -U langflow_user -d langflow_persistent -c \
  "SELECT pg_size_pretty(pg_database_size('langflow_persistent'));"
```

### Weekly Tasks
```bash
# Backup database
./backup.sh  # Or manual backup command

# Check PostgreSQL vacuuming
docker exec langflow-postgres psql -U langflow_user -d langflow_persistent -c \
  "SELECT schemaname, tablename, last_vacuum, last_autovacuum FROM pg_stat_user_tables;"
```

### Monthly Tasks
```bash
# Review disk usage
du -sh ./data
docker system df

# Clean old logs
docker compose logs --tail 0

# Update image (test first!)
docker pull langflowai/langflow:1.1.2
docker compose up -d
```

## Performance Tuning

### PostgreSQL Optimization
```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan;

-- Check table statistics
SELECT schemaname, tablename, n_live_tup, n_dead_tup, last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public';
```

### Langflow Performance
- Keep cache directory clean
- Regular PostgreSQL vacuuming
- Monitor connection pool usage
- Use CDN for static assets if web-facing

## Version Information

**Langflow Version:** 1.1.2
- ARM64 compatible
- PostgreSQL support included
- Tested on Cavium ThunderX ARMv8.0

**PostgreSQL Version:** 16-alpine
- Lightweight Alpine Linux base
- Full PostgreSQL 16 features
- ARM64 native support

## Support

- **PostgreSQL Config:** See `POSTGRESQL_CONFIG.md` in langflow-dev-base
- **Langflow Docs:** https://docs.langflow.org
- **GitHub Issues:** https://github.com/langflow-ai/langflow/issues
- **Database Issues:** Check PostgreSQL logs: `docker logs langflow-postgres`

---

**Setup Date:** March 18, 2026  
**Status:** Ready for production use  
**Access:** http://10.200.111.174:7866  
**Database:** PostgreSQL (persistent, separate from container)  
**Data Safety:** ✅ High - survives container removal
