#!/bin/bash
# ============================================
# BarberFlow — Backup PostgreSQL
# ============================================
# Executa pg_dump, comprime com gzip, rotaciona 7 dias.
# Chamado via cron do host (configurado pelo deploy.sh).

set -e

CONTAINER="barberflow-db"
BACKUP_DIR="/var/lib/docker/volumes/localflow_barberflow_backups/_data"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="barberflow_${TIMESTAMP}.sql.gz"

# Criar diretório se não existir
mkdir -p "$BACKUP_DIR"

# Executar pg_dump dentro do container e comprimir
docker exec "$CONTAINER" pg_dump \
  -U "$( docker exec "$CONTAINER" printenv POSTGRES_USER )" \
  -d "$( docker exec "$CONTAINER" printenv POSTGRES_DB )" \
  --no-owner --clean --if-exists \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

# Verificar se o backup foi criado
if [ -s "${BACKUP_DIR}/${FILENAME}" ]; then
  SIZE=$(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)
  echo "[$(date)] Backup criado: ${FILENAME} (${SIZE})"
else
  echo "[$(date)] ERRO: Backup vazio ou falhou!"
  rm -f "${BACKUP_DIR}/${FILENAME}"
  exit 1
fi

# Remover backups antigos (manter últimos N dias)
find "$BACKUP_DIR" -name "barberflow_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
REMAINING=$(ls -1 "$BACKUP_DIR"/barberflow_*.sql.gz 2>/dev/null | wc -l)
echo "[$(date)] Backups retidos: ${REMAINING}"
