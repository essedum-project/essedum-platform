# Langflow Development Setup

Simple Langflow setup using Docker Compose on ARM64 (Cavium ThunderX).

## System Information

- **Platform:** Linux ARM64 (aarch64)
- **CPU:** Cavium ThunderX ARMv8.0 (part 0x0a1)
- **Docker Image:** `langflowai/langflow:1.1.2`
- **Image Architecture:** arm64
- **Container Name:** `langflow`
- **Base Directory:** `/home/mamindla/langflow-dev-base`

## Prerequisites

- Docker and Docker Compose installed
- ARM64 Linux system
- Port 7865 available
- Minimum 2GB RAM recommended
- ~500MB disk space for image + data

## Quick Start

### Start Langflow

```bash
cd /home/mamindla/langflow-dev-base
docker compose up -d
```

### Stop Langflow

```bash
docker compose down
```

### Restart Langflow

```bash
docker compose restart
```

## Access Langflow

Once started, access Langflow at:
- **Local:** http://localhost:7865
- **Network:** http://10.200.111.174:7865

## Useful Commands

### Check Container Status
```bash
docker compose ps
```

### View Logs (Live)
```bash
docker compose logs -f
```

### View Last 100 Log Lines
```bash
docker compose logs --tail 100
```

### Check if Langflow is Responding
```bash
curl -I http://localhost:7865
```

### Restart Only Langflow Service
```bash
docker compose restart langflow
```

### Stop and Remove All Data
```bash
docker compose down -v
rm -rf ./data/*
```

## Configuration

Configuration is managed in `docker-compose.yml`:

### Docker Image Details
- **Image:** `langflowai/langflow:1.1.2`
- **Registry:** Docker Hub (langflowai organization)
- **Architecture:** linux/arm64
- **Python Version:** 3.12.12
- **Langflow Binary:** `/app/.venv/bin/langflow`
- **Working Directory:** `/app`

### Container Configuration
- **Container Name:** `langflow`
- **Restart Policy:** `unless-stopped` (auto-restart on failure)
- **Network Mode:** bridge (default)
- **Port Mapping:** `7865:7865` (host:container)

### Environment Variables
```yaml
LANGFLOW_HOST: 0.0.0.0          # Listen on all interfaces
LANGFLOW_PORT: 7865             # Internal port
LANGFLOW_DATABASE_URL: sqlite:////app/data/langflow.db
LANGFLOW_LOG_LEVEL: debug       # Logging verbosity
LANGFLOW_CACHE_DIR: /app/data/cache
```

### Volume Mounts
```
./data:/app/data
```
- **Host Path:** `/home/mamindla/langflow-dev-base/data`
- **Container Path:** `/app/data`
- **Purpose:** Persistent storage for database, cache, and user flows
- **Permissions:** Read-write

### Resources (Default)
- **CPU:** Unlimited (uses available cores)
- **Memory:** Unlimited (typically uses 200-500MB)
- **Storage:** Host-dependent

## Container Details

### Running Container Info
```bash
# Get detailed container information
docker inspect langflow

# Check resource usage
docker stats langflow

# View container processes
docker top langflow

# Check container IP address
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' langflow
```

### Container Lifecycle
```bash
# Start container
docker compose up -d

# Stop container (graceful shutdown)
docker compose stop

# Stop container (force kill after 10s)
docker compose down

# Restart container
docker compose restart

# Pause container (freeze processes)
docker pause langflow

# Resume container
docker unpause langflow
```

## Files and Structure

```
langflow-dev-base/
├── docker-compose.yml      # Service definition
├── Dockerfile             # Not used (prebuilt image)
├── README.md             # This file
└── data/                 # Persistent data (auto-created)
    ├── langflow.db       # SQLite database
    ├── cache/            # Application cache
    └── .writetest        # Permission test file
```

## Troubleshooting

### Container Keeps Restarting
```bash
# Check restart count
docker inspect -f '{{.RestartCount}}' langflow

# Check container status and exit code
docker inspect -f 'Status={{.State.Status}} ExitCode={{.State.ExitCode}} OOM={{.State.OOMKilled}}' langflow

# View logs for errors
docker compose logs langflow --tail 200

# Check if container is running
docker ps --filter name=langflow
```

### Container Exits with Code 132 (SIGILL)
This means CPU instruction incompatibility:
- ✅ **Solution:** Use version **1.1.2** (confirmed working)
- ❌ **Avoid:** `latest` tag causes "Illegal instruction" on older ARM64

### No Logs from Container
```bash
# Check if container is actually running
docker ps -a --filter name=langflow

# Verify log driver
docker inspect langflow | jq '.[0].HostConfig.LogConfig'

# Try running interactively
docker run -it --rm -p 7865:7865 langflowai/langflow:1.1.2
```

### Port Already in Use
```bash
# Check what's using port 7865
sudo lsof -i :7865
sudo netstat -tlnp | grep 7865

# Kill process using the port
sudo kill -9 <PID>

# Or change port in docker-compose.yml to "8080:7865"
```

### Permission Issues with Data Directory
```bash
# Check current permissions
ls -la ./data

# Fix permissions
chmod 777 ./data

# Check container user
docker exec langflow id
```

### Container Can't Access Database
```bash
# Check database file
ls -lh ./data/langflow.db

# Check container can write
docker exec langflow touch /app/data/.test && echo "Success" || echo "Failed"

# Reset database (WARNING: deletes all data)
docker compose down
rm -f ./data/langflow.db
docker compose up -d
```

### Container Network Issues
```bash
# Check container network settings
docker inspect langflow | jq '.[0].NetworkSettings'

# Test from inside container
docker exec langflow curl -I http://localhost:7865

# Check firewall rules
sudo iptables -L -n | grep 7865
```

### High Resource Usage
```bash
# Monitor resources live
docker stats langflow

# Check disk usage
docker system df
du -sh ./data

# Limit memory (add to docker-compose.yml)
# mem_limit: 1g
# mem_reservation: 512m
```

### Image Pull Issues
```bash
# Manually pull image
docker pull langflowai/langflow:1.1.2

# Verify image architecture matches system
docker image inspect langflowai/langflow:1.1.2 | jq -r '.[0].Architecture'
uname -m

# Clean old images
docker image prune -a
```

### ARM64 Compatibility Issues
- ✅ Version **1.1.2** is tested and working on Cavium ThunderX
- ❌ Avoid `latest` tag - causes "Illegal instruction" errors on older ARM64 CPUs
- If issues persist, try version 1.0.19 or 0.6.x

## Advanced Container Management

### Inspect Container Details
```bash
# Full container configuration
docker inspect langflow > langflow-inspect.json

# Environment variables
docker exec langflow env | grep LANGFLOW

# Running processes
docker top langflow

# Port mappings
docker port langflow

# Resource limits
docker inspect langflow | jq '.[0].HostConfig | {Memory, MemorySwap, CpuShares, CpuQuota}'
```

### Container Shell Access
```bash
# Access container shell
docker exec -it langflow /bin/sh

# Run commands in container
docker exec langflow pwd
docker exec langflow ls -la /app/data
docker exec langflow python --version
docker exec langflow langflow --version
```

### Update to Newer Version
```bash
# Pull new version
docker pull langflowai/langflow:1.1.3

# Update docker-compose.yml (change image version)
# Then restart
docker compose down
docker compose up -d

# Verify version
docker exec langflow langflow --version
```

### Container Health Monitoring
```bash
# Add health check to docker-compose.yml:
# healthcheck:
#   test: ["CMD", "curl", "-f", "http://localhost:7865/health"]
#   interval: 30s
#   timeout: 10s
#   retries: 3
#   start_period: 40s

# Check health status
docker inspect langflow | jq '.[0].State.Health'
```

### Export/Import Container
```bash
# Save container as image
docker commit langflow langflow-backup:$(date +%Y%m%d)

# Save image to tar file
docker save langflow-backup:$(date +%Y%m%d) -o langflow-backup.tar

# Load image on another system
docker load -i langflow-backup.tar
```

## Version Notes

**Current Version:** 1.1.2

### Version Compatibility Matrix
| Version | ARM64 Support | Cavium ThunderX | Status | Notes |
|---------|---------------|-----------------|--------|-------|
| latest  | ✅ Yes | ❌ No | SIGILL error (exit 132) | Uses newer CPU instructions |
| 1.1.2   | ✅ Yes | ✅ Yes | **WORKING** | Recommended for older ARM64 |
| 1.0.19  | ❌ No | ❌ No | amd64 only | x86_64 architecture only |
| 0.6.x   | ⚠️ Limited | ❓ Unknown | Not tested | Legacy version |

### Testing Your Version
```bash
# Test if version works on your CPU
docker run --rm langflowai/langflow:1.1.2 langflow --version

# If you see "Illegal instruction" - version is incompatible
# If you see version number - version works!
```

### Version-Specific Details

**1.1.2 (Current)**
- Release Date: ~December 2024
- Python: 3.12.12
- Architecture: linux/arm64
- Size: ~450MB compressed
- ARMv8.0 compatible (no advanced SIMD requirements)

### Checking Image Information
```bash
# Image size
docker image ls langflowai/langflow:1.1.2

# Detailed image info
docker image inspect langflowai/langflow:1.1.2 | jq '{
  Architecture: .[0].Architecture,
  OS: .[0].Os,
  Size: .[0].Size,
  Created: .[0].Created,
  Layers: .[0].RootFS.Layers | length
}'

# Image layers
docker history langflowai/langflow:1.1.2
```

## Maintenance

### Regular Maintenance Tasks

**Weekly:**
```bash
# Check logs for errors
docker compose logs --tail 200 | grep -i error

# Check disk usage
du -sh ./data
```

**Monthly:**
```bash
# Backup data
tar -czf langflow-backup-$(date +%Y%m%d).tar.gz data/

# Clean Docker system
docker system prune -f

# Check for updates (test in dev first)
docker pull langflowai/langflow:1.1.2
```

**As Needed:**
```bash
# Clear cache
rm -rf ./data/cache/*
docker compose restart

# Optimize database (if using SQLite)
docker exec langflow sqlite3 /app/data/langflow.db "VACUUM;"
```

## Data Backup

To backup your flows and data:
```bash
cd /home/mamindla/langflow-dev-base

# Full backup with timestamp
tar -czf langflow-backup-$(date +%Y%m%d-%H%M%S).tar.gz data/

# Backup to specific location
tar -czf /backup/langflow-$(date +%Y%m%d).tar.gz data/

# List backup contents
tar -tzf langflow-backup-*.tar.gz | head -20
```

To restore:
```bash
# Stop container first
docker compose down

# Restore backup
tar -xzf langflow-backup-YYYYMMDD-HHMMSS.tar.gz

# Restart container
docker compose up -d
```

### Automated Backup Script
Create `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/backup/langflow"
mkdir -p "$BACKUP_DIR"
cd /home/mamindla/langflow-dev-base
tar -czf "$BACKUP_DIR/langflow-$(date +%Y%m%d-%H%M%S).tar.gz" data/
# Keep only last 7 backups
ls -t "$BACKUP_DIR"/langflow-*.tar.gz | tail -n +8 | xargs -r rm
```

## Monitoring and Logs

### Real-time Monitoring
```bash
# Follow logs live
docker compose logs -f

# Follow with timestamps
docker compose logs -f --timestamps

# Monitor specific keywords
docker compose logs -f | grep -i "error\|warning\|exception"

# Monitor resource usage
watch -n 2 'docker stats langflow --no-stream'
```

### Log Management
```bash
# View recent logs
docker compose logs --tail 100

# View logs from specific time
docker compose logs --since 30m
docker compose logs --since 2024-03-18T10:00:00

# Export logs to file
docker compose logs > langflow-logs-$(date +%Y%m%d).txt

# Clear logs (restart container)
docker compose restart

# Limit log size in docker-compose.yml:
# logging:
#   driver: "json-file"
#   options:
#     max-size: "10m"
#     max-file: "3"
```

### Performance Metrics
```bash
# Current stats
docker stats langflow --no-stream

# Continuous monitoring
docker stats langflow

# Export stats to CSV
printf "Time,CPU,Memory\n" > stats.csv
while true; do
  docker stats langflow --no-stream --format "table {{.CPUPerc}},{{.MemUsage}}" | \
  tail -n1 | sed "s/^/$(date +%H:%M:%S),/" >> stats.csv
  sleep 5
done
```

## Security Considerations

### Network Security
```bash
# Run on localhost only (change in docker-compose.yml)
# ports:
#   - "127.0.0.1:7865:7865"

# Use firewall to restrict access
sudo ufw allow from 10.200.111.0/24 to any port 7865
sudo ufw deny 7865
```

### File Permissions
```bash
# Secure data directory (restrictive)
chmod 770 ./data
chown -R $USER:$USER ./data

# Or permissive for testing
chmod 777 ./data
```

### Environment Variables
```bash
# Store sensitive configs in .env file
# Create .env in same directory as docker-compose.yml:
LANGFLOW_DATABASE_URL=sqlite:////app/data/langflow.db
LANGFLOW_LOG_LEVEL=info

# Reference in docker-compose.yml:
# environment:
#   - LANGFLOW_DATABASE_URL=${LANGFLOW_DATABASE_URL}
```

## Reference Information

### Docker Compose Commands
```bash
docker compose up -d          # Start in background
docker compose down           # Stop and remove containers
docker compose restart        # Restart services
docker compose ps             # List containers
docker compose logs           # View logs
docker compose pull           # Pull latest images
docker compose build          # Build images
docker compose config         # Validate and view config
```

### Docker Commands
```bash
docker ps                     # List running containers
docker ps -a                  # List all containers
docker logs langflow          # View container logs
docker exec -it langflow sh   # Access container shell
docker inspect langflow       # Inspect container
docker stats langflow         # View resource usage
docker stop langflow          # Stop container
docker start langflow         # Start container
docker restart langflow       # Restart container
docker rm langflow            # Remove container
```

### Useful Environment Variables
```yaml
LANGFLOW_HOST: 0.0.0.0                    # Bind address
LANGFLOW_PORT: 7865                       # Service port
LANGFLOW_DATABASE_URL: sqlite:////app/data/langflow.db
LANGFLOW_LOG_LEVEL: debug|info|warning|error
LANGFLOW_CACHE_DIR: /app/data/cache
LANGFLOW_WORKERS: 1                       # Number of workers
LANGFLOW_AUTO_LOGIN: false                # Auto-login (dev only)
```

## Support and Resources

### Official Resources
- **GitHub:** https://github.com/langflow-ai/langflow
- **Documentation:** https://docs.langflow.org
- **Docker Hub:** https://hub.docker.com/r/langflowai/langflow
- **Discord:** https://discord.gg/langflow

### Reporting Issues
If you encounter ARM64-specific issues:
1. Check if using version 1.1.2
2. Collect logs: `docker compose logs > langflow-error.log`
3. System info: `uname -a && cat /proc/cpuinfo | grep -i "model\|cpu"`
4. Report at: https://github.com/langflow-ai/langflow/issues

### Quick Diagnostics
Run this diagnostic script:
```bash
#!/bin/bash
echo "=== System Info ==="
uname -a
echo -e "\n=== CPU Info ==="
cat /proc/cpuinfo | grep -i "model\|implementer\|part" | head -5
echo -e "\n=== Docker Version ==="
docker --version
docker compose version
echo -e "\n=== Container Status ==="
docker ps --filter name=langflow
echo -e "\n=== Image Info ==="
docker image ls langflowai/langflow:1.1.2
echo -e "\n=== Restart Count ==="
docker inspect -f '{{.RestartCount}}' langflow 2>/dev/null || echo "Container not running"
echo -e "\n=== Recent Logs ==="
docker logs langflow --tail 20 2>/dev/null || echo "No logs available"
echo -e "\n=== Port Check ==="
curl -I http://localhost:7865 2>&1 | head -3
```

---

**Setup Confirmed Working:**
- Date: March 18, 2026
- System: Cavium ThunderX ARMv8.0 (part 0x0a1)
- Image: langflowai/langflow:1.1.2
- Status: ✅ Running successfully on http://10.200.111.174:7865
