"use server"

import type { FeatureReport } from "@/types/report-types"

export interface ApiEndpoint {
  path: string
  method: string
  currentLoad: string
  estimatedLoad: string
  impact: "high" | "medium" | "low"
  recommendation: string
}

export interface FeatureApiImpact {
  featureId: string
  featureName: string
  impactedEndpoints: ApiEndpoint[]
  overallRisk: "high" | "medium" | "low"
  recommendations: string[]
}

// This would be a real database query in production
const API_ENDPOINTS = [
  { path: "/auth/register", method: "POST", avgRequestsPerMinute: 50 },
  { path: "/auth/login", method: "POST", avgRequestsPerMinute: 245 },
  { path: "/products", method: "GET", avgRequestsPerMinute: 350 },
  { path: "/recommendations", method: "POST", avgRequestsPerMinute: 120 },
  { path: "/recommendations", method: "GET", avgRequestsPerMinute: 420 },
  { path: "/users/profile", method: "GET", avgRequestsPerMinute: 180 },
  { path: "/users/follows", method: "POST", avgRequestsPerMinute: 80 },
  { path: "/saved-items", method: "POST", avgRequestsPerMinute: 95 },
  { path: "/saved-items", method: "GET", avgRequestsPerMinute: 150 },
]

// Keywords that might indicate API endpoint impact
const FEATURE_API_KEYWORDS: Record<string, string[]> = {
  authentication: ["/auth/login", "/auth/register"],
  login: ["/auth/login"],
  register: ["/auth/register"],
  user: ["/users/profile", "/users/follows"],
  profile: ["/users/profile"],
  product: ["/products"],
  recommendation: ["/recommendations"],
  friend: ["/users/follows", "/recommendations"],
  discover: ["/recommendations", "/products"],
  share: ["/recommendations"],
  save: ["/saved-items"],
  wishlist: ["/saved-items"],
  buy: ["/products", "/saved-items"],
  purchase: ["/products"],
  explore: ["/products", "/recommendations"],
}

export async function analyzeFeatureApiImpact(feature: FeatureReport): Promise<FeatureApiImpact> {
  // In a real implementation, this would use ML/AI to analyze the feature
  // and determine which API endpoints would be impacted

  // For demo purposes, we'll use a keyword-based approach
  const featureText =
    `${feature.name} ${feature.description || ""} ${feature.userStories?.join(" ") || ""}`.toLowerCase()

  const impactedEndpointPaths = new Set<string>()

  // Find keywords in the feature text that match our API mapping
  Object.entries(FEATURE_API_KEYWORDS).forEach(([keyword, endpoints]) => {
    if (featureText.includes(keyword.toLowerCase())) {
      endpoints.forEach((endpoint) => impactedEndpointPaths.add(endpoint))
    }
  })

  // If no endpoints were found, add some default ones based on complexity
  if (impactedEndpointPaths.size === 0) {
    if (feature.complexity > 7) {
      // High complexity features likely impact multiple endpoints
      impactedEndpointPaths.add("/auth/login")
      impactedEndpointPaths.add("/users/profile")
    } else if (feature.complexity > 4) {
      // Medium complexity features might impact a couple endpoints
      impactedEndpointPaths.add("/products")
    } else {
      // Low complexity features might impact just one endpoint
      impactedEndpointPaths.add("/recommendations")
    }
  }

  // Map the impacted endpoint paths to full endpoint objects
  const impactedEndpoints = Array.from(impactedEndpointPaths).map((path) => {
    const endpoint = API_ENDPOINTS.find((e) => e.path === path) || { path, method: "GET", avgRequestsPerMinute: 100 }

    // Calculate estimated additional load based on feature complexity and business value
    const complexityFactor = feature.complexity / 10
    const valueFactor = feature.businessValue / 10
    const estimatedAdditionalLoad = Math.round(endpoint.avgRequestsPerMinute * complexityFactor * valueFactor)

    // Determine impact level
    let impact: "high" | "medium" | "low" = "low"
    if (estimatedAdditionalLoad > endpoint.avgRequestsPerMinute * 0.5) {
      impact = "high"
    } else if (estimatedAdditionalLoad > endpoint.avgRequestsPerMinute * 0.2) {
      impact = "medium"
    }

    // Generate recommendation
    let recommendation = "No changes needed, endpoint can handle additional load"
    if (impact === "high") {
      recommendation = "Consider scaling this endpoint or implementing a queue system"
    } else if (impact === "medium") {
      recommendation = "Implement caching and monitor performance after deployment"
    }

    return {
      path: endpoint.path,
      method: endpoint.method,
      currentLoad: `${endpoint.avgRequestsPerMinute} req/min`,
      estimatedLoad: `${estimatedAdditionalLoad} req/min`,
      impact,
      recommendation,
    }
  })

  // Determine overall risk based on the highest impact level
  const hasHighImpact = impactedEndpoints.some((e) => e.impact === "high")
  const hasMediumImpact = impactedEndpoints.some((e) => e.impact === "medium")
  const overallRisk: "high" | "medium" | "low" = hasHighImpact ? "high" : hasMediumImpact ? "medium" : "low"

  // Generate overall recommendations
  const recommendations: string[] = []
  if (hasHighImpact) {
    recommendations.push("Consider phased rollout to monitor API performance")
    recommendations.push("Implement rate limiting for affected endpoints")
  }
  if (feature.complexity > 7) {
    recommendations.push("Break down this feature into smaller components to reduce API impact")
  }
  if (impactedEndpoints.length > 2) {
    recommendations.push("Review API architecture to optimize for this feature")
  }

  return {
    featureId: feature.id,
    featureName: feature.name,
    impactedEndpoints,
    overallRisk,
    recommendations: recommendations.length > 0 ? recommendations : ["No significant API changes needed"],
  }
}
