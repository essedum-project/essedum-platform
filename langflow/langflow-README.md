# Langflow Persistent - Quick Reference

**Status:** ✅ Production Deployed  
**URL:** https://langflow.essedum-lfn.infosys.com/  
**Namespace:** aipns  
**Database:** PostgreSQL (langflowdb)  

---

## 📁 Files

```
langflow/
├── langflow-deployment.yaml            # Kubernetes deployment config
├── langflow-service.yaml               # Kubernetes service config
├── langflow-ingress.yaml               # Kubernetes ingress config
├── langflow-manage.sh                  # ⭐ Interactive management menu
├── langflow-db-helper.sh               # ⭐ Database helper (loads .env credentials)
├── langflow-test.md                    # 📋 All testing commands
├── Dockerfile                          # Custom Docker build
├── langflow-deployment-details.md      # 📖 Complete documentation
├── langflow-README.md                  # This file
├── CONFIG.md                           # Configuration guide
├── .env.example                        # Environment variables template (for reference)
├── .env                                # 🔐 Actual credentials (gitignored, NOT in repo)
├── .gitignore                          # Git ignore patterns
└── langflow-ingress-backup-*.yaml      # Ingress backups (not in repo)
```

**Note:** `.env` file contains sensitive data and is automatically excluded from git.

---

## 🚀 Quick Start

### Management Menu (Recommended)
```bash
cd /home/engne2/essedum/essedum-platform/langflow
./langflow-manage.sh
```

**Interactive menu with 20+ operations:**
- Pod status, details, logs
- Database operations, backups
- Start/stop/restart operations
- YAML configuration viewing
- Testing and troubleshooting

### Database Testing Helper (with .env credentials)
```bash
cd /home/engne2/essedum/essedum-platform/langflow
./langflow-db-helper.sh
```

**Automatically loads credentials from .env and provides:**
- Database connection testing
- Table inspection
- Data queries
- Interactive shell
- Backup operations

---

## 📋 Key Information

### Deployment
- **Name:** langflow-persistent
- **Replicas:** 1
- **Image:** langflowai/langflow:latest
- **Resources:** 500m-2000m CPU, 1Gi-4Gi RAM

### Database
- **Host:** postgres.aipns.svc.cluster.local
- **Port:** 5432
- **Database:** langflowdb
- **User:** See `.env` file
- **Password:** See `.env` file
- **Connection:** See `LANGFLOW_DATABASE_URL` in `.env` file

> **Note:** All database credentials are stored in `.env` file. Copy `.env.example` to `.env` and update with your actual credentials.

### Network
- **Service:** langflow-persistent (ClusterIP: 10.102.68.146)
- **Ingress:** langflow-ingress → langflow-persistent
- **External URL:** https://langflow.essedum-lfn.infosys.com/

---

## ⚡ Common Commands

**View pod status:**
```bash
kubectl get pods -n aipns -l app=langflow-persistent
```

**View logs:**
```bash
kubectl logs -f deployment/langflow-persistent -n aipns
```

**Restart pod:**
```bash
# Safe restart (no version change)
kubectl rollout restart deployment/langflow-persistent -n aipns
```

**Update version (⚠️ Only upgrade, never downgrade!):**
```bash
# Backup first, then update to latest
POSTGRES_POD=$(kubectl get pod -n aipns -l app=postgres-langfuse -o jsonpath='{.items[0].metadata.name}')
kubectl exec $POSTGRES_POD -n aipns -- pg_dump -U langfuse langflowdb > backup.sql
kubectl set image deployment/langflow-persistent langflow=langflowai/langflow:latest -n aipns

# If update fails, rollback
kubectl rollout undo deployment/langflow-persistent -n aipns
```

**Database backup:**
```bash
POSTGRES_POD=$(kubectl get pod -n aipns -l app=postgres-langfuse -o jsonpath='{.items[0].metadata.name}')
kubectl exec $POSTGRES_POD -n aipns -- pg_dump -U langfuse langflowdb > backup_$(date +%Y%m%d).sql
```

**All test commands:**
```bash
# See langflow-test.md for complete list of testing commands including:
# - Database inspection, flow management, persistence testing
# - Interactive shell access, backup/restore procedures
# - Health checks, troubleshooting, and more
cat langflow-test.md
```

---

## 📖 Documentation

- **Quick Reference:** This file (langflow-README.md)
- **Complete Guide:** [langflow-deployment-details.md](langflow-deployment-details.md)
  - Full pod/container configuration
  - Database schema and operations  
  - Network topology
  - Complete YAML configurations
  - Troubleshooting guide
  - Rollback procedures

## 🔐 Configuration Management

All sensitive configuration is stored in `.env` file:
- Database credentials (username, password)
- Connection strings
- Application settings

**Important:** 
- `.env` file is gitignored and never committed to repository
- Use `.env.example` as a template for creating your `.env` file
- Update credentials in `.env` before deployment

---

## 🔄 Rollback to Old Langflow

If needed, switch ingress back to old Langflow (SQLite):

```bash
kubectl patch ingress langflow-ingress -n aipns --type='json' -p='[
  {"op": "replace", "path": "/spec/rules/0/http/paths/0/backend/service/name", "value": "langflow"}
]'
```

**Backup file:** `langflow-ingress-backup-20260313-084309.yaml`

---

## ✅ Deployment Status

**Deployed:** March 13, 2026  
**Status:** Production Active  
**Data Persistence:** ✅ Verified  
**Pod Restarts:** ✅ Tested (0 data loss)  
**Database:** 35 flows, 2 folders, 1 user
