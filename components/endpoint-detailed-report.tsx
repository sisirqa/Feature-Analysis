"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileJson, FileText, ArrowLeft, Lightbulb } from "lucide-react"
import EndpointHourlyDistribution from "./endpoint-hourly-distribution"
import EndpointDailyTrend from "./endpoint-daily-trend"
import EndpointDropFrequency from "./endpoint-drop-frequency"
import type { FeatureData } from "@/types/report-types"

interface EndpointDetailedReportProps {
  endpoint: string
  logs: any[]
  onBack: () => void
  features?: FeatureData[]
}

export default function EndpointDetailedReport({ endpoint, logs, onBack, features }: EndpointDetailedReportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isPdfExporting, setIsPdfExporting] = useState(false)
  const [relatedFeatures, setRelatedFeatures] = useState<FeatureData[]>([])

  // Filter logs for this endpoint
  const endpointLogs = logs.filter((log) => log.endpoint === endpoint)

  // Calculate metrics
  const totalRequests = endpointLogs.length
  const uniqueIPs = new Set(endpointLogs.map((log) => log.ip || log.public_ip)).size

  // Response times (if available)
  const responseTimes = endpointLogs
    .map((log) => log.duration || log.response_time)
    .filter((time) => time !== undefined && !isNaN(Number(time)))
    .map((time) => Number(time))

  const avgResponseTime =
    responseTimes.length > 0 ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0

  // Status code distribution
  const statusCodeDist: Record<string, number> = {}
  endpointLogs.forEach((log) => {
    const statusCode = log.status_code || log.status || "200"
    statusCodeDist[statusCode] = (statusCodeDist[statusCode] || 0) + 1
  })

  const successRequests = Object.entries(statusCodeDist)
    .filter(([code]) => code.startsWith("2"))
    .reduce((sum, [_, count]) => sum + count, 0)
  const successRate = (successRequests / totalRequests) * 100

  useEffect(() => {
    // If features are provided, find related features based on endpoint name
    if (features && features.length > 0) {
      // Simple keyword matching to find related features
      const endpointKeywords = endpoint
        .toLowerCase()
        .split(/[/\-_]/)
        .filter((k) => k.length > 3)

      const related = features.filter((feature) => {
        const featureKeywords = (feature.name + " " + (feature.description || "")).toLowerCase().split(/\s+/)
        return endpointKeywords.some((ek) => featureKeywords.some((fk) => fk.includes(ek) || ek.includes(fk)))
      })

      setRelatedFeatures(related)
    } else {
      // Sample related features if none provided
      setRelatedFeatures([
        {
          id: "1",
          name: "Browser Change OTP",
          description: "Agent portal - Similar feature as new device OTP for Customer.",
          reach: 8,
          impact: 8,
          confidence: 9,
          effort: 5,
          riceScore: 11.5,
        },
        {
          id: "5",
          name: "Password Reset Config",
          description: "Admin should be able to manage the configuration of password reset from the CMS.",
          reach: 7,
          impact: 6,
          confidence: 9,
          effort: 4,
          riceScore: 9.5,
        },
      ])
    }
  }, [endpoint, features])

  // Export as JSON
  const handleExportJson = () => {
    setIsExporting(true)

    try {
      const dataStr = JSON.stringify(
        {
          endpoint,
          analysis: {
            totalRequests,
            uniqueIPs,
            avgResponseTime,
            successRate,
            statusCodeDistribution: statusCodeDist,
            relatedFeatures: relatedFeatures.map((f) => f.name),
          },
          logs: endpointLogs,
        },
        null,
        2,
      )

      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

      const exportFileDefaultName = `${endpoint.replace(/\//g, "_")}_analysis.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()
    } catch (error) {
      console.error("Error exporting JSON:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // Export as PDF
  const handleExportPdf = async () => {
    setIsPdfExporting(true)

    try {
      const response = await fetch("/api/generate-endpoint-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint,
          logs: endpointLogs,
          relatedFeatures: relatedFeatures,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const data = await response.json()

      // Create a download link for the PDF
      const linkElement = document.createElement("a")
      linkElement.href = data.pdfBase64
      linkElement.download = data.filename
      linkElement.click()
    } catch (error) {
      console.error("Error exporting PDF:", error)
    } finally {
      setIsPdfExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportJson} disabled={isExporting}>
            <FileJson className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export JSON"}
          </Button>
          <Button variant="outline" onClick={handleExportPdf} disabled={isPdfExporting}>
            <FileText className="mr-2 h-4 w-4" />
            {isPdfExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Endpoint Analysis</CardTitle>
              <CardDescription>Detailed analysis for {endpoint}</CardDescription>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {totalRequests} Requests
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{totalRequests}</div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{successRate.toFixed(2)}%</div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{avgResponseTime.toFixed(2)} ms</div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{uniqueIPs}</div>
                <p className="text-sm text-muted-foreground">Unique Users</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="hourly">
            <TabsList className="mb-4">
              <TabsTrigger value="hourly">Hourly Distribution</TabsTrigger>
              <TabsTrigger value="daily">Daily Trend</TabsTrigger>
              <TabsTrigger value="status">Status Codes</TabsTrigger>
              <TabsTrigger value="drops">Drop Frequency</TabsTrigger>
              <TabsTrigger value="features">Related Features</TabsTrigger>
            </TabsList>
            <TabsContent value="hourly">
              <EndpointHourlyDistribution logs={endpointLogs} endpoint={endpoint} />
            </TabsContent>
            <TabsContent value="daily">
              <EndpointDailyTrend logs={endpointLogs} endpoint={endpoint} />
            </TabsContent>
            <TabsContent value="status">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Status Code Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(statusCodeDist).map(([code, count]) => (
                    <Card key={code}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-2xl font-bold">{code}</div>
                            <p className="text-sm text-muted-foreground">Status Code</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-semibold">{count}</div>
                            <p className="text-sm text-muted-foreground">
                              {((count / totalRequests) * 100).toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="drops">
              <EndpointDropFrequency logs={endpointLogs} endpoint={endpoint} />
            </TabsContent>
            <TabsContent value="features">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Related Features</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These features are related to this API endpoint and may impact or be impacted by changes to this
                  endpoint.
                </p>

                {relatedFeatures.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedFeatures.map((feature, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg">{feature.name}</CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                              <p className="text-sm font-medium">RICE Score</p>
                              <p className="text-lg font-bold">{feature.riceScore.toFixed(1)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Effort</p>
                              <p className="text-lg font-bold">{feature.effort}/10</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            <p className="text-sm">
                              {feature.effort > 7
                                ? "High effort feature - consider API optimization before implementation"
                                : feature.effort > 4
                                  ? "Medium effort feature - monitor API performance during implementation"
                                  : "Low effort feature - minimal API impact expected"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md">
                    <p>No related features found for this endpoint.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
          <CardDescription>Evaluation of endpoint performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Response Time</h3>
                  <div className="text-2xl font-bold">{avgResponseTime.toFixed(2)} ms</div>
                  <Badge
                    className="mt-2"
                    variant={avgResponseTime < 500 ? "success" : avgResponseTime < 1000 ? "default" : "destructive"}
                  >
                    {avgResponseTime < 500 ? "Excellent" : avgResponseTime < 1000 ? "Good" : "Needs Improvement"}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Success Rate</h3>
                  <div className="text-2xl font-bold">{successRate.toFixed(2)}%</div>
                  <Badge
                    className="mt-2"
                    variant={successRate > 99 ? "success" : successRate > 95 ? "default" : "destructive"}
                  >
                    {successRate > 99 ? "Excellent" : successRate > 95 ? "Good" : "Needs Improvement"}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-2">Overall Rating</h3>
                  <div className="text-2xl font-bold">
                    {avgResponseTime < 500 && successRate > 99
                      ? "Excellent"
                      : avgResponseTime < 1000 && successRate > 95
                        ? "Good"
                        : "Needs Improvement"}
                  </div>
                  <Badge
                    className="mt-2"
                    variant={
                      avgResponseTime < 500 && successRate > 99
                        ? "success"
                        : avgResponseTime < 1000 && successRate > 95
                          ? "default"
                          : "destructive"
                    }
                  >
                    {avgResponseTime < 500 && successRate > 99
                      ? "Excellent"
                      : avgResponseTime < 1000 && successRate > 95
                        ? "Good"
                        : "Needs Improvement"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {avgResponseTime > 1000 && <li>Optimize endpoint performance to reduce response time</li>}
                  {successRate < 95 && <li>Investigate and fix errors causing failed requests</li>}
                  {uniqueIPs < 10 && <li>Consider promoting this API to increase usage</li>}
                  <li>Monitor this endpoint regularly to ensure consistent performance</li>
                  <li>Consider implementing rate limiting if usage patterns show potential for abuse</li>
                  {relatedFeatures.length > 0 && (
                    <li>
                      Coordinate with feature teams implementing {relatedFeatures.map((f) => f.name).join(", ")} to
                      ensure compatibility
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
