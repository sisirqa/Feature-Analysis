export interface FeatureData {
  id?: string
  name: string
  description?: string
  reach: number
  impact: number
  confidence: number
  effort: number
  riceScore: number
}

export interface FeatureReport {
  id: string
  name: string
  description?: string
  effort: number
  impact: number
  confidence?: number
  riceScore: number
  complexity: number
  businessValue: number
  risk: string
  timeline: number
  dependencies?: string[]
  userStories?: string[]
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
