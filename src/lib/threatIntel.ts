// src/lib/threatIntel.ts

export interface ThreatAssessment {
  cvssScore: number;        // Common Vulnerability Scoring System analog
  attackVector: string;
  mitigations: string[];
  iocTags: string[];        // Indicators of Compromise
  ttps: string[];           // MITRE ATT&CK-style Tactics, Techniques, Procedures
}

export function assessThreat(verdict: string, confidence: number, mediaType: string): ThreatAssessment {
  const isHighConfidenceFake = verdict === 'DEEPFAKE' && confidence > 0.85;

  return {
    cvssScore: isHighConfidenceFake ? 8.5 : confidence * 5,
    attackVector: mediaType === 'video' ? 'VISUAL_IMPERSONATION' : 
                  mediaType === 'audio' ? 'VOICE_CLONING' : 'IMAGE_MANIPULATION',
    mitigations: [
      'Cross-reference with trusted identity sources',
      'Request live video confirmation for high-stakes decisions',
      isHighConfidenceFake ? 'ESCALATE: Do not act on this media without verification' : 
                             'Monitor for additional suspicious activity',
    ],
    iocTags: [
      `media-type:${mediaType}`,
      `verdict:${verdict.toLowerCase()}`,
      `confidence-tier:${confidence > 0.9 ? 'critical' : confidence > 0.7 ? 'high' : 'medium'}`,
    ],
    ttps: [
      'T1566 - Phishing (via synthetic media)',
      'T1036 - Masquerading',
      isHighConfidenceFake ? 'T1598 - Spearphishing for Information' : '',
    ].filter(Boolean),
  };
}

// Rate limiting and abuse detection
const requestLog = new Map<string, number[]>();

export function detectAbuse(ip: string): { blocked: boolean; reason?: string } {
  const now = Date.now();
  const window = 60_000; // 1 minute
  const maxRequests = 30;

  const timestamps = (requestLog.get(ip) || []).filter(t => now - t < window);
  timestamps.push(now);
  requestLog.set(ip, timestamps);

  if (timestamps.length > maxRequests) {
    return { blocked: true, reason: `Rate limit exceeded: ${timestamps.length} requests/min` };
  }
  return { blocked: false };
}
