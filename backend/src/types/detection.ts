// src/types/detection.ts — Single source of truth for all verdict shapes

export const VERDICT = {
  DEEPFAKE: 'DEEPFAKE',
  AUTHENTIC: 'AUTHENTIC', 
  UNCERTAIN: 'UNCERTAIN',
} as const;

export type Verdict = typeof VERDICT[keyof typeof VERDICT];

export const RISK_LEVEL = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type RiskLevel = typeof RISK_LEVEL[keyof typeof RISK_LEVEL];

export interface ForensicIndicator {
  category: 'FACIAL' | 'TEMPORAL' | 'FREQUENCY' | 'METADATA' | 'COMPRESSION';
  description: string;
  severity: 'INFO' | 'WARNING' | 'ALERT';
  confidence: number;
}

export interface DetectionVerdict {
  verdict: Verdict;
  confidenceScore: number;           // 0.0 – 1.0
  riskLevel: RiskLevel;
  forensicIndicators: ForensicIndicator[];
  mlAnomalyScore: number;            // From IsolationForest
  llmReasoning: string;              // Claude's explanation
  processingTimeMs: number;
  timestamp: string;                 // ISO 8601
  mediaMetadata: {
    type: 'image' | 'video' | 'audio';
    sizeBytes: number;
    durationSeconds?: number;
    resolution?: string;
  };
}

// Zod schema for runtime validation (add zod to deps)
import { z } from 'zod';

export const DetectionRequestSchema = z.object({
  mediaType: z.enum(['image', 'video', 'audio']),
  mediaBase64: z.string().min(100),
  mimeType: z.string(),
  options: z.object({
    strictMode: z.boolean().default(false),
    includeMLScore: z.boolean().default(true),
  }).optional(),
});

export type DetectionRequest = z.infer<typeof DetectionRequestSchema>;
