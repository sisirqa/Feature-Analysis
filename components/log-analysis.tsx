"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, Upload, BarChart2, Activity, Globe } from "lucide-react"
import LogAnalysisChart from "@/components/log-analysis-chart"
import EndpointUsageChart from "@/components/endpoint-usage-chart"
import IPDistributionChart from "@/components/ip-distribution-chart"
import {
  analyzeAccessLogs,
  generateSampleLogs,
  type LogEntry,
  type LogAnalysisResult,
} from "@/services/log-analysis-service"

export default function LogAnalysis() {
  const [isLoading, setIsLoading] = useState(false)
  const [logData, setLogData] = useState<LogEntry[]>([])
  const [analysisResult, setAnalysisResult] = useState<LogAnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Load sample data on mount
  useEffect(() => {
    handleLoadSampleData()
  }, [])

  const handleLoadSampleData = async () => {
    setIsLoading(true)
    try {
      // Generate sample logs
      const sampleLogs = generateSampleLogs(30, 200)
      setLogData(sampleLogs)

      // Analyze logs
      const result = await analyzeAccessLogs(sampleLogs)
      setAnalysisResult(result)
    } catch (error) {
      console.error("Error loading sample data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const text = await file.text()
      // Parse log file (simplified - assumes JSON format)
      const logs = JSON.parse(text) as LogEntry[]
      setLogData(logs)

      // Analyze logs
      const result = await analyzeAccessLogs(logs)
      setAnalysisResult(result)
    } catch (error) {
      console.error("Error parsing log file:", error)
      alert("Error parsing log file. Please ensure it's in the correct format.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportAnalysis = () => {
    if (!analysisResult) return

    const dataStr = JSON.stringify(analysisResult, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `log-analysis-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  if (!analysisResult) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Log Analysis</h2>
          <p className="text-muted-foreground mb-4">Upload access logs to analyze feature usage patterns</p>
          <Button onClick={handleLoadSampleData} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load Sample Data"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Log Analysis</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleLoadSampleData} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load Sample Data"}
          </Button>
          <Button variant="outline" className="relative" disabled={isLoading}>
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              accept=".json,.txt"
            />
            <Upload className="h-4 w-4 mr-2" />
            Upload Logs
          </Button>
          <Button onClick={handleExportAnalysis} disabled={!analysisResult}>
            <Download className="h-4 w-4 mr-2" />
            Export Analysis
          </Button>
        </div>
      </div>

      <Alert>
        <Activity className="h-4 w-4" />
        <AlertTitle>Analysis Complete</AlertTitle>
        <AlertDescription>
          Analyzed {analysisResult.totalRequests.toLocaleString()} requests from{" "}
          {analysisResult.uniqueIPs.toLocaleString()} unique IPs across{" "}
          {analysisResult.uniqueEndpoints.toLocaleString()} endpoints.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{analysisResult.totalRequests.toLocaleString()}</CardTitle>
            <CardDescription>Total Requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Over the past 30 days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{analysisResult.uniqueIPs.toLocaleString()}</CardTitle>
            <CardDescription>Unique Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Based on unique IP addresses</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{analysisResult.uniqueEndpoints.toLocaleString()}</CardTitle>
            <CardDescription>API Endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Distinct features accessed</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            Usage Overview
          </TabsTrigger>
          <TabsTrigger value="endpoints">
            <BarChart2 className="h-4 w-4 mr-2" />
            Endpoint Analysis
          </TabsTrigger>
          <TabsTrigger value="users">
            <Globe className="h-4 w-4 mr-2" />
            User Distribution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Usage Trends</CardTitle>
              <CardDescription>Request volume over the past 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <LogAnalysisChart data={analysisResult.dailyUsage} title="Daily Request Volume" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Endpoints</CardTitle>
                <CardDescription>Most frequently accessed features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.topEndpoints.slice(0, 5).map((endpoint, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-full">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{endpoint.endpoint.replace("/api/", "")}</span>
                          <span className="text-sm font-medium">{endpoint.count.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${(endpoint.count / analysisResult.topEndpoints[0].count) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
                <CardDescription>User distribution by geographic region</CardDescription>
              </CardHeader>
              <CardContent>
                <IPDistributionChart data={analysisResult.ipDistribution} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Usage Analysis</CardTitle>
              <CardDescription>Detailed breakdown of endpoint usage patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <EndpointUsageChart data={analysisResult.topEndpoints} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endpoint Usage Trends</CardTitle>
              <CardDescription>Usage patterns for top 5 endpoints over time</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={analysisResult.endpointTrends[0]?.endpoint || ""}>
                <TabsList className="mb-4">
                  {analysisResult.endpointTrends.map((trend, index) => (
                    <TabsTrigger key={index} value={trend.endpoint}>
                      {trend.endpoint.replace("/api/", "")}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {analysisResult.endpointTrends.map((trend, index) => (
                  <TabsContent key={index} value={trend.endpoint}>
                    <LogAnalysisChart
                      data={trend.usage}
                      title={`Usage Trend: ${trend.endpoint}`}
                      color={`hsla(${index * 60}, 70%, 60%, 0.7)`}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Enhancement Recommendations</CardTitle>
              <CardDescription>Based on usage patterns and response times</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">High-Value Enhancement Opportunities</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {analysisResult.topEndpoints.slice(0, 3).map((endpoint, index) => (
                      <li key={index}>
                        <span className="font-medium">{endpoint.endpoint.replace("/api/", "")}</span>: High usage (
                        {endpoint.count.toLocaleString()} requests) with
                        {endpoint.avgResponseTime > 200
                          ? ` slow response time (${endpoint.avgResponseTime.toFixed(0)}ms)`
                          : ` good response time (${endpoint.avgResponseTime.toFixed(0)}ms)`}
                        .
                        {endpoint.avgResponseTime > 200
                          ? " Performance optimization recommended."
                          : " Consider adding new features."}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Low-Usage Features</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {analysisResult.topEndpoints.slice(-3).map((endpoint, index) => (
                      <li key={index}>
                        <span className="font-medium">{endpoint.endpoint.replace("/api/", "")}</span>: Low usage (
                        {endpoint.count.toLocaleString()} requests).
                        {endpoint.successRate < 95
                          ? ` Has issues (${endpoint.successRate.toFixed(1)}% success rate).`
                          : ` Works well (${endpoint.successRate.toFixed(1)}% success rate).`}{" "}
                        Consider{" "}
                        {endpoint.count < 100 ? "deprecating or improving visibility" : "improving documentation"}.
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Effort vs. Usage Analysis</h3>
                  <p className="mb-2">Based on the log analysis, we recommend:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-medium">High Priority:</span> Optimize performance for high-usage endpoints
                      with slow response times
                    </li>
                    <li>
                      <span className="font-medium">Medium Priority:</span> Add new features to high-usage endpoints
                      with good performance
                    </li>
                    <li>
                      <span className="font-medium">Low Priority:</span> Improve or deprecate low-usage endpoints
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Analysis of user patterns and geographic distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <IPDistributionChart data={analysisResult.ipDistribution} />
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Regional Insights</h3>
                  <p>
                    User distribution shows concentration in specific regions, which should inform feature
                    prioritization. Features used predominantly by users in high-traffic regions should be prioritized
                    for enhancement.
                  </p>
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">Top User Locations</h4>
                    <ul className="space-y-2">
                      {Array.from(new Set(analysisResult.ipDistribution.map((ip) => ip.region)))
                        .slice(0, 4)
                        .map((region, index) => {
                          const count = analysisResult.ipDistribution
                            .filter((ip) => ip.region === region)
                            .reduce((sum, ip) => sum + ip.count, 0)
                          return (
                            <li key={index} className="flex justify-between">
                              <span>{region}</span>
                              <span className="font-medium">{count.toLocaleString()} requests</span>
                            </li>
                          )
                        })}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Behavior Analysis</CardTitle>
              <CardDescription>Patterns in how users interact with the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Usage Patterns</h3>
                  <p>Analysis of the logs reveals the following user behavior patterns:</p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>Peak usage occurs during business hours (9 AM - 5 PM)</li>
                    <li>Most users access between 3-5 different endpoints per session</li>
                    <li>The most common user flow is: login → view users → view transactions</li>
                    <li>Mobile usage accounts for approximately 35% of all requests</li>
                  </ul>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Feature Enhancement Recommendations</h3>
                  <p>Based on user behavior analysis, we recommend:</p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>Optimize the most common user flows to reduce friction</li>
                    <li>Improve mobile experience for key features</li>
                    <li>Consider regional customizations for features heavily used in specific regions</li>
                    <li>Implement caching strategies during peak usage hours</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
