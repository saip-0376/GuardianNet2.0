#  GuardianNet2.0 — AI-Powered Deepfake Detection SIEM
> Real-time deepfake detection for images, video, and voice — with enterprise SIEM integration, ML ensemble scoring, and cloud-native deployment.

![Architecture](docs/ARCHITECTURE.md)

##  Quick Start (One Command)
```bash
git clone https://github.com/purvask2006-collab/GuardianNet-Final
cd GuardianNet-Final
cp .env.example .env  # Add your ANTHROPIC_API_KEY
docker compose up
# → App: http://localhost:5173
# → Kibana SIEM: http://localhost:5601
```

##  Architecture
[embed your architecture diagram here]

**Detection pipeline:** React → Node.js API → Claude Vision + IsolationForest ML → ELK SIEM

## 🔧 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + TypeScript | Upload UI, real-time verdicts |
| API | Node.js + Express | Detection orchestration |
| LLM | Anthropic Claude | Semantic forensic analysis |
| ML | scikit-learn IsolationForest | Anomaly scoring |
| SIEM | ELK Stack | Security event monitoring |
| Orchestration | Docker + Kubernetes | Scalable deployment |
| OS | Linux (Ubuntu 22.04) | Production environment |

##  Features
- **Multi-modal detection:** Image, video, and voice deepfake analysis
- **Ensemble scoring:** LLM + ML for higher accuracy than either alone
- **SIEM integration:** Every detection event indexed in Elasticsearch
- **MITRE ATT&CK mapping:** Threat intelligence for each verdict
- **Auto-scaling:** Kubernetes HPA handles traffic spikes
- **One-command deploy:** Full stack via Docker Compose

##  Kibana Dashboard
[screenshot of kibana here]

##  Deployment

### Docker (Development)
```bash
docker compose up
```

### Kubernetes (Production)
```bash
kubectl apply -f k8s/
```

### Linux Setup
```bash
chmod +x scripts/setup-linux.sh && sudo ./scripts/setup-linux.sh
```
