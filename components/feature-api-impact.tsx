"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, ArrowRight, BarChart2, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { FeatureData } from "@/types/report-types"
import type { LogEntry, EndpointUsage } from "@/services/log-analysis-service"
import { analyzeFeatureApiImpact, type FeatureApiImpact } from "@/services/feature-api-mapping-service"
import { generateSampleLogs } from "@/services/log-analysis-service"

interface FeatureApiImpactProps {
  feature: FeatureData
  apiEndpoints?: EndpointUsage[]
  logs?: LogEntry[]
}

export default function FeatureApiImpactAnalysis({
  feature,
  apiEndpoints: initialEndpoints,
  logs: initialLogs,
}: FeatureApiImpactProps) {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [apiImpact, setApiImpact] = useState<FeatureApiImpact | null>(null)
  const [apiEndpoints, setApiEndpoints] = useState<EndpointUsage[] | null>(initialEndpoints || null)
  const [logs, setLogs] = useState<LogEntry[] | null>(initialLogs || null)

  useEffect(() => {
    // If we don't have logs or endpoints, generate sample data
    if (!logs || !apiEndpoints) {
      const sampleLogs = generateSampleLogs(30, 200)
      setLogs(sampleLogs)

      // Generate sample endpoints from logs
      const endpointMap = new Map<string, { count: number; totalResponseTime: number; successCount: number }>()

      sampleLogs.forEach((log) => {
        const endpoint = log.endpoint
        const current = endpointMap.get(endpoint) || { count: 0, totalResponseTime: 0, successCount: 0 }

        current.count += 1
        current.totalResponseTime += log.responseTime
        if (log.statusCode >= 200 && log.statusCode < 400) {
          current.successCount += 1
        }

        endpointMap.set(endpoint, current)
      })

      const sampleEndpoints: EndpointUsage[] = Array.from(endpointMap.entries())
        .map(([endpoint, data]) => ({
          endpoint,
          count: data.count,
          avgResponseTime: data.totalResponseTime / data.count,
          successRate: (data.successCount / data.count) * 100,
        }))
        .sort((a, b) => b.count - a.count)

      setApiEndpoints(sampleEndpoints)
    }
  }, [logs, apiEndpoints])

  const handleAnalyze = () => {
    if (!apiEndpoints || !logs) return

    setIsAnalyzing(true)

    // Simulate analysis process
    setTimeout(() => {
      const impact = analyzeFeatureApiImpact(feature, apiEndpoints, logs)
      setApiImpact(impact)
      setIsAnalyzing(false)
    }, 1500)
  }

  const handleViewEndpointAnalysis = (endpoint: string) => {
    // Navigate to endpoint analysis page with the selected endpoint
    router.push(`/endpoint-analysis?endpoint=${encodeURIComponent(endpoint)}`)
  }

  const getImpactColor = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Impact Analysis</CardTitle>
          <CardDescription>Analyze how this feature might impact existing API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          {!apiImpact ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This analysis will identify API endpoints that may be affected by implementing the feature "
                {feature.name}" and provide recommendations for implementation.
              </p>

              <Button onClick={handleAnalyze} disabled={isAnalyzing || !apiEndpoints}>
                {isAnalyzing ? "Analyzing..." : "Analyze API Impact"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Feature: {apiImpact.featureName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Analysis of potential API impact for implementing this feature
                  </p>
                </div>
                <Badge className={getImpactColor(apiImpact.overallApiImpact)}>
                  {apiImpact.overallApiImpact.charAt(0).toUpperCase() + apiImpact.overallApiImpact.slice(1)} Impact
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-2">API Impact</h4>
                    <div className="text-2xl font-bold capitalize">{apiImpact.overallApiImpact}</div>
                    <p className="text-sm text-muted-foreground mt-1">Overall impact on existing APIs</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-2">Implementation Complexity</h4>
                    <div className="text-2xl font-bold capitalize">{apiImpact.implementationComplexity}</div>
                    <p className="text-sm text-muted-foreground mt-1">Estimated complexity to implement</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-2">Affected Endpoints</h4>
                    <div className="text-2xl font-bold">{apiImpact.affectedEndpoints.length}</div>
                    <p className="text-sm text-muted-foreground mt-1">Number of potentially affected APIs</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="endpoints">
                <TabsList>
                  <TabsTrigger value="endpoints">Affected Endpoints</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>

                <TabsContent value="endpoints" className="space-y-4">
                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3">Endpoint</th>
                          <th className="text-left p-3">Impact</th>
                          <th className="text-left p-3">Current Usage</th>
                          <th className="text-left p-3">Avg Response</th>
                          <th className="text-left p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiImpact.affectedEndpoints.map((endpoint, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3 font-medium">{endpoint.endpoint}</td>
                            <td className="p-3">
                              <Badge className={getImpactColor(endpoint.impactLevel)}>
                                {endpoint.impactLevel.charAt(0).toUpperCase() + endpoint.impactLevel.slice(1)}
                              </Badge>
                            </td>
                            <td className="p-3">{endpoint.currentUsage.toLocaleString()} requests</td>
                            <td className="p-3">{endpoint.currentPerformance.toFixed(0)} ms</td>
                            <td className="p-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewEndpointAnalysis(endpoint.endpoint)}
                              >
                                <BarChart2 className="h-4 w-4 mr-2" />
                                Analyze
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {apiImpact.affectedEndpoints.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-3 text-center text-muted-foreground">
                              No affected endpoints identified
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {apiImpact.affectedEndpoints.length > 0 && (
                    <Alert
                      className={
                        apiImpact.overallApiImpact === "high"
                          ? "bg-red-50 border-red-200"
                          : apiImpact.overallApiImpact === "medium"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-green-50 border-green-200"
                      }
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>API Impact Assessment</AlertTitle>
                      <AlertDescription>
                        {apiImpact.overallApiImpact === "high"
                          ? "This feature will have a significant impact on existing APIs. Careful planning and testing is required."
                          : apiImpact.overallApiImpact === "medium"
                            ? "This feature will have a moderate impact on existing APIs. Additional testing is recommended."
                            : "This feature will have minimal impact on existing APIs. Standard testing should be sufficient."}
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Implementation Recommendations</CardTitle>
                      <CardDescription>Based on the API impact analysis, we recommend the following:</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {apiImpact.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {apiImpact.affectedEndpoints.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Endpoint-Specific Recommendations</CardTitle>
                        <CardDescription>Specific recommendations for affected endpoints:</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {apiImpact.affectedEndpoints.map((endpoint, index) => (
                            <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                              <h4 className="font-medium mb-2">{endpoint.endpoint}</h4>

                              {endpoint.potentialIssues.length > 0 && (
                                <div className="mb-2">
                                  <h5 className="text-sm font-medium text-amber-700">Potential Issues:</h5>
                                  <ul className="list-disc pl-5 text-sm">
                                    {endpoint.potentialIssues.map((issue, i) => (
                                      <li key={i}>{issue}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {endpoint.recommendations.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-green-700">Recommendations:</h5>
                                  <ul className="list-disc pl-5 text-sm">
                                    {endpoint.recommendations.map((rec, i) => (
                                      <li key={i}>{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setApiImpact(null)}>
                      Reset Analysis
                    </Button>
                    <Link href="/endpoint-analysis">
                      <Button className="flex items-center gap-2">
                        <span>Go to API Endpoint Analysis</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
