import type { FeatureData } from "@/types/report-types"
import type { LogEntry, EndpointUsage } from "@/services/log-analysis-service"

export interface FeatureApiImpact {
  featureId: string
  featureName: string
  affectedEndpoints: {
    endpoint: string
    impactLevel: "high" | "medium" | "low"
    currentUsage: number
    currentPerformance: number
    potentialIssues: string[]
    recommendations: string[]
  }[]
  overallApiImpact: "high" | "medium" | "low"
  implementationComplexity: "high" | "medium" | "low"
  recommendations: string[]
}

export function analyzeFeatureApiImpact(
  feature: FeatureData,
  apiEndpoints: EndpointUsage[],
  logs: LogEntry[],
): FeatureApiImpact {
  // Map feature keywords to potential API endpoints
  const featureKeywords = extractKeywords(feature.name + " " + (feature.description || ""))

  // Find potentially affected endpoints based on keyword matching
  const affectedEndpoints = apiEndpoints
    .map((endpoint) => {
      const endpointKeywords = extractKeywords(endpoint.endpoint)
      const matchScore = calculateMatchScore(featureKeywords, endpointKeywords)

      if (matchScore > 0.2) {
        // Threshold for considering an endpoint affected
        // Filter logs for this endpoint
        const endpointLogs = logs.filter((log) => log.endpoint === endpoint.endpoint)

        // Calculate current performance metrics
        const avgResponseTime = endpointLogs.reduce((sum, log) => sum + log.responseTime, 0) / endpointLogs.length

        // Determine impact level based on endpoint usage and match score
        let impactLevel: "high" | "medium" | "low" = "low"
        if (matchScore > 0.6 && endpoint.count > 1000) {
          impactLevel = "high"
        } else if (matchScore > 0.4 || endpoint.count > 500) {
          impactLevel = "medium"
        }

        // Identify potential issues
        const potentialIssues = identifyPotentialIssues(feature, endpoint, avgResponseTime)

        // Generate recommendations
        const recommendations = generateRecommendations(feature, endpoint, impactLevel, potentialIssues)

        return {
          endpoint: endpoint.endpoint,
          impactLevel,
          currentUsage: endpoint.count,
          currentPerformance: avgResponseTime,
          potentialIssues,
          recommendations,
        }
      }
      return null
    })
    .filter(Boolean) as FeatureApiImpact["affectedEndpoints"]

  // Determine overall API impact
  const overallApiImpact = determineOverallImpact(affectedEndpoints)

  // Determine implementation complexity
  const implementationComplexity = determineImplementationComplexity(feature, affectedEndpoints)

  // Generate overall recommendations
  const recommendations = generateOverallRecommendations(
    feature,
    affectedEndpoints,
    overallApiImpact,
    implementationComplexity,
  )

  return {
    featureId: feature.id || "unknown",
    featureName: feature.name,
    affectedEndpoints,
    overallApiImpact,
    implementationComplexity,
    recommendations,
  }
}

// Helper functions
function extractKeywords(text: string): string[] {
  // Simple keyword extraction - in a real implementation, this would be more sophisticated
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3) // Filter out short words
}

function calculateMatchScore(keywords1: string[], keywords2: string[]): number {
  const matches = keywords1.filter((k1) => keywords2.some((k2) => k2.includes(k1) || k1.includes(k2)))
  return matches.length / Math.max(keywords1.length, 1)
}

function identifyPotentialIssues(feature: FeatureData, endpoint: EndpointUsage, avgResponseTime: number): string[] {
  const issues: string[] = []

  // High usage endpoints might face performance issues with new features
  if (endpoint.count > 1000 && avgResponseTime > 200) {
    issues.push("High usage endpoint with existing performance concerns")
  }

  // Low success rate endpoints might become more unstable
  if (endpoint.successRate < 95) {
    issues.push(`Endpoint has reliability issues (${endpoint.successRate.toFixed(1)}% success rate)`)
  }

  // High effort features might complicate existing endpoints
  if (feature.effort > 7) {
    issues.push("Complex feature implementation may affect endpoint stability")
  }

  return issues
}

function generateRecommendations(
  feature: FeatureData,
  endpoint: EndpointUsage,
  impactLevel: "high" | "medium" | "low",
  issues: string[],
): string[] {
  const recommendations: string[] = []

  if (impactLevel === "high") {
    recommendations.push("Conduct thorough performance testing before implementation")
    recommendations.push("Consider implementing the feature in phases to monitor impact")
  }

  if (endpoint.count > 1000) {
    recommendations.push("Implement caching strategies to minimize additional load")
  }

  if (endpoint.successRate < 95) {
    recommendations.push("Resolve existing reliability issues before adding new functionality")
  }

  if (issues.some((issue) => issue.includes("performance"))) {
    recommendations.push("Optimize endpoint performance before adding new features")
  }

  return recommendations
}

function determineOverallImpact(affectedEndpoints: FeatureApiImpact["affectedEndpoints"]): "high" | "medium" | "low" {
  if (affectedEndpoints.some((endpoint) => endpoint.impactLevel === "high")) {
    return "high"
  }

  if (affectedEndpoints.some((endpoint) => endpoint.impactLevel === "medium")) {
    return "medium"
  }

  return "low"
}

function determineImplementationComplexity(
  feature: FeatureData,
  affectedEndpoints: FeatureApiImpact["affectedEndpoints"],
): "high" | "medium" | "low" {
  // Base complexity on feature effort
  if (feature.effort > 7) {
    return "high"
  }

  if (feature.effort > 4) {
    return "medium"
  }

  // Increase complexity if many high-impact endpoints are affected
  if (affectedEndpoints.filter((e) => e.impactLevel === "high").length > 2) {
    return "high"
  }

  return "low"
}

function generateOverallRecommendations(
  feature: FeatureData,
  affectedEndpoints: FeatureApiImpact["affectedEndpoints"],
  overallApiImpact: "high" | "medium" | "low",
  implementationComplexity: "high" | "medium" | "low",
): string[] {
  const recommendations: string[] = []

  if (overallApiImpact === "high") {
    recommendations.push("Conduct a detailed API impact assessment before proceeding")
    recommendations.push("Consider creating new API endpoints instead of modifying existing ones")
  }

  if (implementationComplexity === "high") {
    recommendations.push("Break down implementation into smaller, manageable phases")
    recommendations.push("Allocate additional QA resources for thorough testing")
  }

  if (affectedEndpoints.length > 3) {
    recommendations.push("Create a comprehensive test plan covering all affected endpoints")
  }

  // Add feature-specific recommendations based on RICE score
  if (feature.riceScore > 10) {
    recommendations.push("High-value feature - prioritize implementation with appropriate safeguards")
  } else if (feature.riceScore < 5) {
    recommendations.push("Consider if the API impact justifies implementing this lower-value feature")
  }

  return recommendations
}

// Function to map feature keywords to potential API endpoints
export function mapFeatureToEndpoints(feature: FeatureData, availableEndpoints: string[]): string[] {
  const featureKeywords = extractKeywords(feature.name + " " + (feature.description || ""))

  return availableEndpoints.filter((endpoint) => {
    const endpointKeywords = extractKeywords(endpoint)
    const matchScore = calculateMatchScore(featureKeywords, endpointKeywords)
    return matchScore > 0.2 // Threshold for considering an endpoint related
  })
}
