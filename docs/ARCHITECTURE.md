# GuardianNet — System Architecture

## High-Level Design

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| LLM Provider | Anthropic Claude | Best-in-class vision + structured JSON output |
| ML Approach | Ensemble (LLM + IsolationForest) | Reduces false negatives from either alone |
| Observability | ELK Stack | Industry-standard for SIEM workloads |
| Deployment | Docker + k8s | Reproducible, scalable, cloud-agnostic |
| Language | TypeScript + Node.js | Type safety for structured verdict objects |

## Data Flow

1. User uploads media → S3-compatible storage
2. API validates + extracts metadata
3. **Parallel:** Claude vision analysis + ML anomaly scoring
4. Ensemble merger weights both scores
5. Verdict + threat assessment generated
6. Event shipped to Logstash → indexed in Elasticsearch
7. Response returned to user (<3s target P99)
