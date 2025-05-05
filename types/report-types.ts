export interface FeatureData {
  name: string
  reach: number
  impact: number
  confidence: number
  effort: number
  riceScore: number
}

export interface RiskData {
  name: string
  severity: string
  probability: string
  mitigation: string
}

export interface ComponentData {
  name: string
  impactLevel: string
  changes: string
}

export interface TimelineData {
  name: string
  duration: string
  deliverables: string
}

export interface ChartData {
  name: string
  effort: number
  impact: number
}
