#!/bin/bash
set -e

# ============================================
# BarberFlow — Script de Deploy na VPS
# ============================================
# Uso: chmod +x scripts/deploy.sh && ./scripts/deploy.sh

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo "==========================================="
echo "  BarberFlow — Deploy"
echo "==========================================="
echo ""

# ──────────────────────────────────────────
# 1. Verificar Docker e Docker Compose
# ──────────────────────────────────────────
command -v docker >/dev/null 2>&1 || err "Docker não encontrado. Instale: https://docs.docker.com/engine/install/"
docker compose version >/dev/null 2>&1 || err "Docker Compose (plugin) não encontrado."
log "Docker e Docker Compose instalados"

# ──────────────────────────────────────────
# 2. Detectar rede do n8n
# ──────────────────────────────────────────
N8N_NETWORK=$(docker network ls --format '{{.Name}}' | grep -i n8n | head -1)

if [ -z "$N8N_NETWORK" ]; then
  warn "Rede do n8n não encontrada. Criando 'n8n_default'..."
  docker network create n8n_default
  log "Rede 'n8n_default' criada"
else
  log "Rede do n8n detectada: $N8N_NETWORK"
  if [ "$N8N_NETWORK" != "n8n_default" ]; then
    warn "A rede do n8n é '$N8N_NETWORK', mas o docker-compose espera 'n8n_default'."
    warn "Edite docker-compose.yml ou crie um alias da rede."
  fi
fi

# ──────────────────────────────────────────
# 3. Configurar .env
# ──────────────────────────────────────────
if [ ! -f .env ]; then
  cp .env.example .env
  warn "Arquivo .env criado a partir de .env.example"
  warn "⚠️  EDITE O ARQUIVO .env ANTES DE CONTINUAR!"
  warn "   - Defina POSTGRES_PASSWORD (senha forte)"
  warn "   - Defina NEXTAUTH_SECRET (openssl rand -base64 32)"
  warn "   - Defina NEXTAUTH_URL (http://SEU-IP)"
  echo ""
  read -p "Pressione Enter após editar o .env, ou Ctrl+C para cancelar..."
fi

# Validar que senhas padrão foram trocadas
if grep -q "TROCAR_POR_" .env; then
  err "O arquivo .env ainda contém valores padrão (TROCAR_POR_*). Edite antes de continuar."
fi

log "Arquivo .env configurado"

# ──────────────────────────────────────────
# 4. Subir os serviços
# ──────────────────────────────────────────
log "Construindo e iniciando containers..."
docker compose up -d --build

# Aguardar app estar pronto
echo -n "Aguardando app iniciar"
for i in $(seq 1 30); do
  if docker compose exec barberflow-app nc -z localhost 3000 2>/dev/null; then
    echo ""
    log "App está rodando!"
    break
  fi
  echo -n "."
  sleep 2
done
echo ""

# ──────────────────────────────────────────
# 5. Configurar backup automático
# ──────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup.sh"

if [ -f "$BACKUP_SCRIPT" ]; then
  chmod +x "$BACKUP_SCRIPT"

  # Adicionar cron se ainda não existe
  CRON_JOB="0 2 * * * $BACKUP_SCRIPT >> /var/log/barberflow-backup.log 2>&1"
  if ! crontab -l 2>/dev/null | grep -q "barberflow"; then
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    log "Backup diário configurado (02:00)"
  else
    log "Cron de backup já configurado"
  fi
fi

# ──────────────────────────────────────────
# 6. Status final
# ──────────────────────────────────────────
echo ""
echo "==========================================="
echo "  Deploy concluído!"
echo "==========================================="
echo ""
docker compose ps
echo ""
log "App:  http://localhost"
log "n8n:  http://localhost/n8n/"
echo ""
warn "Próximos passos:"
echo "  1. Acesse o app e verifique se está funcionando"
echo "  2. No n8n, configure a base URL: http://barberflow-app:3000/api"
echo "  3. Quando tiver domínio, edite o Caddyfile: troque ':80' pelo domínio"
echo ""
