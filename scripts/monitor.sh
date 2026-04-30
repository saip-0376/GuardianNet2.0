#!/bin/bash
# GuardianNet System Health Monitor
# Runs as a cron job: */5 * * * * /opt/guardiannet/scripts/monitor.sh

set -euo pipefail

LOG_FILE="/var/log/guardiannet/health.log"
ALERT_THRESHOLD_CPU=85
ALERT_THRESHOLD_MEM=90
SERVICES=("guardiannet-api" "elasticsearch" "kibana" "logstash")

mkdir -p "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*" | tee -a "$LOG_FILE"
}

check_service() {
  local service=$1
  if docker ps --filter "name=$service" --filter "status=running" | grep -q "$service"; then
    log "✓ $service: RUNNING"
  else
    log "✗ $service: DOWN — attempting restart"
    docker restart "$service" 2>/dev/null || log "ERROR: Could not restart $service"
    # Ship alert to ELK
    curl -s -X POST http://localhost:5044 \
      -H 'Content-Type: application/json' \
      -d "{\"event\":\"service_down\",\"service\":\"$service\",\"timestamp\":\"$(date -u +%s)\"}" || true
  fi
}

check_resources() {
  local cpu_usage
  cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | cut -d',' -f1)
  local mem_usage
  mem_usage=$(free | awk '/^Mem:/ {printf "%.0f", $3/$2 * 100}')

  log "CPU: ${cpu_usage}% | MEM: ${mem_usage}%"

  if (( $(echo "$cpu_usage > $ALERT_THRESHOLD_CPU" | bc -l) )); then
    log "ALERT: High CPU usage: ${cpu_usage}%"
  fi

  if (( mem_usage > ALERT_THRESHOLD_MEM )); then
    log "ALERT: High memory usage: ${mem_usage}%"
  fi
}

check_disk() {
  local disk_usage
  disk_usage=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
  log "Disk: ${disk_usage}% used"
  if (( disk_usage > 85 )); then
    log "ALERT: Disk usage critical: ${disk_usage}%"
    # Rotate old logs
    find /var/log/guardiannet -name "*.log" -mtime +7 -delete
  fi
}

log "=== GuardianNet Health Check ==="
for svc in "${SERVICES[@]}"; do
  check_service "$svc"
done
check_resources
check_disk
log "=== Check Complete ==="
