#!/bin/bash
# One-command Linux setup for GuardianNet
set -e

echo "Setting up GuardianNet on Linux..."

# Create dedicated system user (security best practice)
sudo useradd -r -s /bin/false -d /opt/guardiannet guardiannet 2>/dev/null || true

# Directory structure
sudo mkdir -p /opt/guardiannet/{logs,data,certs}
sudo chown -R guardiannet:guardiannet /opt/guardiannet

# Set up log rotation
cat << EOF | sudo tee /etc/logrotate.d/guardiannet
/var/log/guardiannet/*.log {
  daily
  rotate 30
  compress
  delaycompress
  missingok
  notifempty
  create 0640 guardiannet guardiannet
}
EOF

# Install cron job
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/guardiannet/scripts/monitor.sh") | crontab -

# Firewall rules
sudo ufw allow 3000/tcp comment 'GuardianNet API'
sudo ufw allow 5601/tcp comment 'Kibana'
sudo ufw deny 9200/tcp  # Elasticsearch internal only

echo "✓ Linux setup complete"
