// src/lib/eventLogger.ts
interface DetectionEvent {
  timestamp: string;
  mediaType: 'image' | 'video' | 'audio';
  verdict: 'DEEPFAKE' | 'AUTHENTIC' | 'UNCERTAIN';
  confidenceScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  forensicIndicators: string[];
  processingTimeMs: number;
  sourceIp?: string;
}

export async function shipEventToELK(event: DetectionEvent): Promise<void> {
  const logstashUrl = process.env.LOGSTASH_URL || 'http://localhost:5044';
  
  try {
    await fetch(logstashUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
        service: 'guardiannet',
        version: process.env.npm_package_version,
      }),
    });
  } catch (err) {
    // Non-blocking: log locally if ELK is down
    console.error('[ELK] Failed to ship event:', err);
  }
}

// Query historical events from Elasticsearch
export async function queryEvents(filters: {
  verdict?: string;
  from?: string;
  to?: string;
  minConfidence?: number;
}) {
  const esUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
  
  const query = {
    query: {
      bool: {
        must: [
          filters.verdict ? { match: { verdict: filters.verdict } } : { match_all: {} },
          filters.minConfidence ? {
            range: { confidenceScore: { gte: filters.minConfidence } }
          } : null,
        ].filter(Boolean),
        filter: filters.from || filters.to ? [{
          range: {
            timestamp: {
              gte: filters.from || 'now-7d',
              lte: filters.to || 'now',
            }
          }
        }] : [],
      }
    },
    sort: [{ '@timestamp': { order: 'desc' } }],
    size: 100,
  };

  const res = await fetch(`${esUrl}/guardiannet-*/_search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });

  return res.json();
}
