"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, AlertTriangle, Users, Activity, Zap } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import EndpointHourlyDistribution from "@/components/endpoint-hourly-distribution"
import EndpointDailyTrend from "@/components/endpoint-daily-trend"
import EndpointDropFrequency from "@/components/endpoint-drop-frequency"
import type { LogEntry } from "@/services/log-analysis-service"

interface EndpointDetailedReportProps {
  logs: LogEntry[]
  endpoint: string
}

export default function EndpointDetailedReport({ logs, endpoint }: EndpointDetailedReportProps) {
  // Filter logs for the specific endpoint
  const endpointLogs = useMemo(() => logs.filter((log) => log.endpoint === endpoint), [logs, endpoint])

  // Calculate basic metrics
  const metrics = useMemo(() => {
    const totalRequests = endpointLogs.length
    const successfulRequests = endpointLogs.filter((log) => log.statusCode >= 200 && log.statusCode < 400).length
    const failedRequests = totalRequests - successfulRequests
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0
    const avgResponseTime =
      totalRequests > 0 ? endpointLogs.reduce((sum, log) => sum + log.responseTime, 0) / totalRequests : 0
    const p95ResponseTime = calculatePercentile(
      endpointLogs.map((log) => log.responseTime),
      95,
    )
    const uniqueIPs = new Set(endpointLogs.map((log) => log.ip)).size
    const peakHour = calculatePeakHour(endpointLogs)
    const statusCodes = calculateStatusCodeDistribution(endpointLogs)
    const dailyTrend = calculateDailyTrend(endpointLogs)
    const hourlyDistribution = calculateHourlyDistribution(endpointLogs)

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate,
      avgResponseTime,
      p95ResponseTime,
      uniqueIPs,
      peakHour,
      statusCodes,
      dailyTrend,
      hourlyDistribution,
    }
  }, [endpointLogs])

  // Calculate performance recommendations
  const recommendations = useMemo(() => {
    const recommendations = []

    // Response time recommendations
    if (metrics.avgResponseTime > 500) {
      recommendations.push({
        type: "performance",
        severity: "high",
        title: "High Average Response Time",
        description: `The average response time of ${metrics.avgResponseTime.toFixed(0)}ms is high. Consider optimizing the endpoint implementation.`,
      })
    } else if (metrics.avgResponseTime > 200) {
      recommendations.push({
        type: "performance",
        severity: "medium",
        title: "Moderate Response Time",
        description: `The average response time of ${metrics.avgResponseTime.toFixed(0)}ms could be improved. Review the endpoint for potential optimizations.`,
      })
    }

    // Success rate recommendations
    if (metrics.successRate < 95) {
      recommendations.push({
        type: "reliability",
        severity: "high",
        title: "Low Success Rate",
        description: `The success rate of ${metrics.successRate.toFixed(1)}% is below the recommended threshold of 95%. Investigate the causes of failures.`,
      })
    } else if (metrics.successRate < 98) {
      recommendations.push({
        type: "reliability",
        severity: "medium",
        title: "Moderate Success Rate",
        description: `The success rate of ${metrics.successRate.toFixed(1)}% could be improved. Review error patterns to increase reliability.`,
      })
    }

    // Usage pattern recommendations
    const hourlyDistribution = metrics.hourlyDistribution
    const peakHourLoad = hourlyDistribution[metrics.peakHour]
    const avgHourlyLoad = hourlyDistribution.reduce((sum, count) => sum + count, 0) / 24

    if (peakHourLoad > avgHourlyLoad * 3) {
      recommendations.push({
        type: "scaling",
        severity: "high",
        title: "High Peak Hour Load",
        description: `The load during peak hour (${metrics.peakHour}:00) is ${(peakHourLoad / avgHourlyLoad).toFixed(1)}x the average. Consider implementing caching or scaling strategies during peak hours.`,
      })
    }

    return recommendations
  }, [metrics])

  // Calculate enhancement opportunities
  const enhancements = useMemo(() => {
    const enhancements = []

    // High usage enhancement
    if (metrics.totalRequests > 1000) {
      enhancements.push({
        title: "High Usage API",
        description:
          "This endpoint has high usage and would benefit from performance optimizations and caching strategies.",
        impact: "high",
      })
    }

    // Response time enhancement
    if (metrics.p95ResponseTime > 1000) {
      enhancements.push({
        title: "Response Time Optimization",
        description: `The 95th percentile response time (${metrics.p95ResponseTime.toFixed(0)}ms) indicates potential performance issues that could be addressed.`,
        impact: "high",
      })
    }

    // Error handling enhancement
    if (metrics.successRate < 98) {
      enhancements.push({
        title: "Error Handling Improvement",
        description: "Improving error handling and implementing retry mechanisms could increase the success rate.",
        impact: "medium",
      })
    }

    // Usage pattern enhancement
    const hourlyDistribution = metrics.hourlyDistribution
    const peakHourLoad = hourlyDistribution[metrics.peakHour]
    const avgHourlyLoad = hourlyDistribution.reduce((sum, count) => sum + count, 0) / 24

    if (peakHourLoad > avgHourlyLoad * 2) {
      enhancements.push({
        title: "Load Balancing",
        description: `Consider implementing load balancing or caching strategies to handle peak loads at ${metrics.peakHour}:00.`,
        impact: "medium",
      })
    }

    return enhancements
  }, [metrics])

  const handleExportReport = () => {
    // Create a JSON representation of the report
    const report = {
      endpoint,
      metrics,
      recommendations,
      enhancements,
      generatedAt: new Date().toISOString(),
    }

    // Convert to JSON string
    const jsonString = JSON.stringify(report, null, 2)

    // Create a blob and download
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `endpoint-report-${endpoint.replace(/\//g, "-")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Detailed Report: {endpoint}</h2>
        <Button onClick={handleExportReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{metrics.totalRequests.toLocaleString()}</CardTitle>
            <CardDescription>Total Requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Success Rate:</span>
              <span
                className={
                  metrics.successRate >= 98
                    ? "text-green-600"
                    : metrics.successRate >= 95
                      ? "text-yellow-600"
                      : "text-red-600"
                }
              >
                {metrics.successRate.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{metrics.avgResponseTime.toFixed(0)} ms</CardTitle>
            <CardDescription>Avg Response Time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">P95:</span>
              <span>{metrics.p95ResponseTime.toFixed(0)} ms</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{metrics.uniqueIPs.toLocaleString()}</CardTitle>
            <CardDescription>Unique Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Based on IP addresses</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{metrics.peakHour}:00</CardTitle>
            <CardDescription>Peak Usage Hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Highest traffic hour</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="usage">
            <Users className="h-4 w-4 mr-2" />
            Usage Patterns
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Overview</CardTitle>
              <CardDescription>Key metrics and statistics for {endpoint}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Request Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Requests:</span>
                      <span className="font-medium">{metrics.totalRequests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Successful Requests:</span>
                      <span className="font-medium">{metrics.successfulRequests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Failed Requests:</span>
                      <span className="font-medium">{metrics.failedRequests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span
                        className={
                          metrics.successRate >= 98
                            ? "font-medium text-green-600"
                            : metrics.successRate >= 95
                              ? "font-medium text-yellow-600"
                              : "font-medium text-red-600"
                        }
                      >
                        {metrics.successRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Average Response Time:</span>
                      <span
                        className={
                          metrics.avgResponseTime <= 100
                            ? "font-medium text-green-600"
                            : metrics.avgResponseTime <= 300
                              ? "font-medium text-yellow-600"
                              : "font-medium text-red-600"
                        }
                      >
                        {metrics.avgResponseTime.toFixed(0)} ms
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">95th Percentile Response Time:</span>
                      <span
                        className={
                          metrics.p95ResponseTime <= 200
                            ? "font-medium text-green-600"
                            : metrics.p95ResponseTime <= 500
                              ? "font-medium text-yellow-600"
                              : "font-medium text-red-600"
                        }
                      >
                        {metrics.p95ResponseTime.toFixed(0)} ms
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Peak Hour:</span>
                      <span className="font-medium">{metrics.peakHour}:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Unique Users:</span>
                      <span className="font-medium">{metrics.uniqueIPs.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-4">Status Code Distribution</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status Code</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(metrics.statusCodes)
                        .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
                        .map(([code, count]) => {
                          const percentage = (count / metrics.totalRequests) * 100
                          let category = ""
                          let badgeColor = ""

                          if (Number.parseInt(code) >= 200 && Number.parseInt(code) < 300) {
                            category = "Success"
                            badgeColor = "bg-green-100 text-green-800"
                          } else if (Number.parseInt(code) >= 300 && Number.parseInt(code) < 400) {
                            category = "Redirect"
                            badgeColor = "bg-blue-100 text-blue-800"
                          } else if (Number.parseInt(code) >= 400 && Number.parseInt(code) < 500) {
                            category = "Client Error"
                            badgeColor = "bg-yellow-100 text-yellow-800"
                          } else if (Number.parseInt(code) >= 500) {
                            category = "Server Error"
                            badgeColor = "bg-red-100 text-red-800"
                          }

                          return (
                            <TableRow key={code}>
                              <TableCell>{code}</TableCell>
                              <TableCell>{count.toLocaleString()}</TableCell>
                              <TableCell>{percentage.toFixed(1)}%</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={badgeColor}>
                                  {category}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enhancement Opportunities</CardTitle>
              <CardDescription>Potential improvements for this endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              {enhancements.length > 0 ? (
                <div className="space-y-4">
                  {enhancements.map((enhancement, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{enhancement.title}</h3>
                        <Badge
                          variant="outline"
                          className={
                            enhancement.impact === "high"
                              ? "bg-red-100 text-red-800"
                              : enhancement.impact === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }
                        >
                          {enhancement.impact.charAt(0).toUpperCase() + enhancement.impact.slice(1)} Impact
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{enhancement.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No specific enhancement opportunities identified for this endpoint.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Patterns</CardTitle>
              <CardDescription>Analysis of how this endpoint is used over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <EndpointHourlyDistribution logs={logs} endpoint={endpoint} />
                <EndpointDailyTrend logs={logs} endpoint={endpoint} days={30} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Analysis of users accessing this endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">User Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Unique Users:</span>
                      <span className="font-medium">{metrics.uniqueIPs.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Requests per User (Avg):</span>
                      <span className="font-medium">
                        {(metrics.totalRequests / (metrics.uniqueIPs || 1)).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-4">Usage Insights</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>
                      Peak usage occurs at {metrics.peakHour}:00, suggesting this is when most users need this
                      functionality
                    </li>
                    <li>
                      {metrics.uniqueIPs > 100
                        ? "This endpoint is used by a large number of users"
                        : "This endpoint is used by a relatively small number of users"}
                    </li>
                    <li>
                      {metrics.totalRequests / (metrics.uniqueIPs || 1) > 10
                        ? "Users access this endpoint frequently, indicating it's a core functionality"
                        : "Users access this endpoint infrequently, suggesting it's a secondary feature"}
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>Response time and reliability metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Response Time</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Average Response Time:</span>
                      <span
                        className={
                          metrics.avgResponseTime <= 100
                            ? "font-medium text-green-600"
                            : metrics.avgResponseTime <= 300
                              ? "font-medium text-yellow-600"
                              : "font-medium text-red-600"
                        }
                      >
                        {metrics.avgResponseTime.toFixed(0)} ms
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">95th Percentile Response Time:</span>
                      <span
                        className={
                          metrics.p95ResponseTime <= 200
                            ? "font-medium text-green-600"
                            : metrics.p95ResponseTime <= 500
                              ? "font-medium text-yellow-600"
                              : "font-medium text-red-600"
                        }
                      >
                        {metrics.p95ResponseTime.toFixed(0)} ms
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Performance Rating:</span>
                      <span
                        className={
                          metrics.avgResponseTime <= 100
                            ? "font-medium text-green-600"
                            : metrics.avgResponseTime <= 300
                              ? "font-medium text-yellow-600"
                              : "font-medium text-red-600"
                        }
                      >
                        {metrics.avgResponseTime <= 100
                          ? "Excellent"
                          : metrics.avgResponseTime <= 300
                            ? "Good"
                            : "Needs Improvement"}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-4">Reliability</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span
                        className={
                          metrics.successRate >= 98
                            ? "font-medium text-green-600"
                            : metrics.successRate >= 95
                              ? "font-medium text-yellow-600"
                              : "font-medium text-red-600"
                        }
                      >
                        {metrics.successRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Error Rate:</span>
                      <span
                        className={
                          100 - metrics.successRate <= 2
                            ? "font-medium text-green-600"
                            : 100 - metrics.successRate <= 5
                              ? "font-medium text-yellow-600"
                              : "font-medium text-red-600"
                        }
                      >
                        {(100 - metrics.successRate).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Reliability Rating:</span>
                      <span
                        className={
                          metrics.successRate >= 98
                            ? "font-medium text-green-600"
                            : metrics.successRate >= 95
                              ? "font-medium text-yellow-600"
                              : "font-medium text-red-600"
                        }
                      >
                        {metrics.successRate >= 98
                          ? "Excellent"
                          : metrics.successRate >= 95
                            ? "Good"
                            : "Needs Improvement"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <EndpointDropFrequency logs={logs} endpoint={endpoint} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Optimization Opportunities</CardTitle>
              <CardDescription>Potential areas for improvement</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.avgResponseTime > 200 || metrics.successRate < 98 ? (
                <div className="space-y-4">
                  {metrics.avgResponseTime > 500 && (
                    <div className="border rounded-md p-4 bg-red-50">
                      <h3 className="font-medium mb-2">High Response Time</h3>
                      <p>
                        The average response time of {metrics.avgResponseTime.toFixed(0)}ms is significantly higher than
                        the recommended maximum of 200ms. Consider the following optimizations:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Optimize database queries and add appropriate indexes</li>
                        <li>Implement caching for frequently accessed data</li>
                        <li>Review and optimize any complex calculations or processing</li>
                        <li>Consider asynchronous processing for non-critical operations</li>
                      </ul>
                    </div>
                  )}

                  {metrics.avgResponseTime > 200 && metrics.avgResponseTime <= 500 && (
                    <div className="border rounded-md p-4 bg-yellow-50">
                      <h3 className="font-medium mb-2">Moderate Response Time</h3>
                      <p>
                        The average response time of {metrics.avgResponseTime.toFixed(0)}ms is higher than the ideal
                        maximum of 200ms. Consider these optimizations:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Review database queries for potential optimizations</li>
                        <li>Consider implementing caching where appropriate</li>
                        <li>Analyze the endpoint for unnecessary processing</li>
                      </ul>
                    </div>
                  )}

                  {metrics.successRate < 95 && (
                    <div className="border rounded-md p-4 bg-red-50">
                      <h3 className="font-medium mb-2">Low Success Rate</h3>
                      <p>
                        The success rate of {metrics.successRate.toFixed(1)}% is below the recommended minimum of 95%.
                        Consider these improvements:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Investigate the most common error codes and their causes</li>
                        <li>Implement better input validation to prevent client errors</li>
                        <li>Add retry mechanisms for transient failures</li>
                        <li>Improve error handling and logging for better diagnostics</li>
                      </ul>
                    </div>
                  )}

                  {metrics.successRate >= 95 && metrics.successRate < 98 && (
                    <div className="border rounded-md p-4 bg-yellow-50">
                      <h3 className="font-medium mb-2">Moderate Success Rate</h3>
                      <p>
                        The success rate of {metrics.successRate.toFixed(1)}% is acceptable but could be improved.
                        Consider these enhancements:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Review the most common error patterns</li>
                        <li>Improve input validation and error messages</li>
                        <li>Consider implementing graceful degradation for edge cases</li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border rounded-md p-4 bg-green-50">
                  <h3 className="font-medium mb-2 text-green-800">Good Performance</h3>
                  <p className="text-green-700">
                    This endpoint is performing well with an average response time of{" "}
                    {metrics.avgResponseTime.toFixed(0)}
                    ms and a success rate of {metrics.successRate.toFixed(1)}%. No critical optimizations are needed at
                    this time.
                  </p>
                  <p className="text-green-700 mt-2">
                    For continuous improvement, consider implementing monitoring and alerting to maintain this level of
                    performance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Suggested improvements based on analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className={`border rounded-md p-4 ${
                        recommendation.severity === "high"
                          ? "bg-red-50"
                          : recommendation.severity === "medium"
                            ? "bg-yellow-50"
                            : "bg-blue-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{recommendation.title}</h3>
                        <Badge
                          variant="outline"
                          className={
                            recommendation.severity === "high"
                              ? "bg-red-100 text-red-800"
                              : recommendation.severity === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                          }
                        >
                          {recommendation.severity.charAt(0).toUpperCase() + recommendation.severity.slice(1)} Priority
                        </Badge>
                      </div>
                      <p
                        className={
                          recommendation.severity === "high"
                            ? "text-red-700"
                            : recommendation.severity === "medium"
                              ? "text-yellow-700"
                              : "text-blue-700"
                        }
                      >
                        {recommendation.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-md p-4 bg-green-50">
                  <h3 className="font-medium mb-2 text-green-800">No Critical Recommendations</h3>
                  <p className="text-green-700">
                    This endpoint is performing well based on the analyzed metrics. No critical recommendations are
                    needed at this time.
                  </p>
                  <p className="text-green-700 mt-2">
                    For continuous improvement, consider implementing monitoring and alerting to maintain this level of
                    performance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Enhancement Opportunities</CardTitle>
              <CardDescription>Potential improvements based on usage patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Usage-Based Enhancements</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {metrics.totalRequests > 1000 && (
                      <li>
                        <span className="font-medium">High Usage Optimization:</span> This endpoint has high usage (
                        {metrics.totalRequests.toLocaleString()} requests). Consider implementing caching and
                        performance optimizations to improve user experience.
                      </li>
                    )}
                    {metrics.peakHour >= 9 && metrics.peakHour <= 17 && (
                      <li>
                        <span className="font-medium">Business Hours Usage:</span> Peak usage occurs during business
                        hours ({metrics.peakHour}:00), suggesting this is a critical business function. Consider
                        prioritizing enhancements for this endpoint.
                      </li>
                    )}
                    {metrics.uniqueIPs > 100 && (
                      <li>
                        <span className="font-medium">Wide User Base:</span> This endpoint is used by a large number of
                        users ({metrics.uniqueIPs.toLocaleString()}). Consider adding more robust error handling and
                        user-friendly messages.
                      </li>
                    )}
                    {Object.keys(metrics.statusCodes).some((code) => Number.parseInt(code) >= 400) && (
                      <li>
                        <span className="font-medium">Error Handling Improvements:</span> Users are experiencing errors
                        with this endpoint. Consider improving validation, error messages, and implementing retry
                        mechanisms.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Technical Enhancements</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-medium">API Documentation:</span> Ensure this endpoint is well-documented
                      with clear examples and error responses.
                    </li>
                    <li>
                      <span className="font-medium">Versioning Strategy:</span> Implement proper API versioning to allow
                      for future enhancements without breaking existing clients.
                    </li>
                    <li>
                      <span className="font-medium">Monitoring:</span> Set up detailed monitoring and alerting for this
                      endpoint to quickly identify issues.
                    </li>
                    <li>
                      <span className="font-medium">Rate Limiting:</span> Consider implementing rate limiting to protect
                      the endpoint from abuse and ensure fair usage.
                    </li>
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

// Helper functions
function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[index]
}

function calculatePeakHour(logs: LogEntry[]): number {
  const hourCounts = new Array(24).fill(0)
  logs.forEach((log) => {
    const hour = new Date(log.timestamp).getHours()
    hourCounts[hour]++
  })
  return hourCounts.indexOf(Math.max(...hourCounts))
}

function calculateStatusCodeDistribution(logs: LogEntry[]): Record<string, number> {
  const statusCodes: Record<string, number> = {}
  logs.forEach((log) => {
    const code = log.statusCode.toString()
    statusCodes[code] = (statusCodes[code] || 0) + 1
  })
  return statusCodes
}

function calculateDailyTrend(logs: LogEntry[]): { date: string; count: number }[] {
  const dailyCounts = new Map<string, number>()
  logs.forEach((log) => {
    const date = new Date(log.timestamp).toISOString().split("T")[0]
    dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1)
  })
  return Array.from(dailyCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function calculateHourlyDistribution(logs: LogEntry[]): number[] {
  const hourCounts = new Array(24).fill(0)
  logs.forEach((log) => {
    const hour = new Date(log.timestamp).getHours()
    hourCounts[hour]++
  })
  return hourCounts
}
