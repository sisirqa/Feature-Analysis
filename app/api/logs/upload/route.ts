import { type NextRequest, NextResponse } from "next/server"
import { parse } from "csv-parse/sync"
import type { LogEntry } from "@/services/log-analysis-service"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 })
    }

    // Read file content
    const fileContent = await file.text()

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    // Check if we have any records
    if (!records || !records.length) {
      return NextResponse.json({
        success: true,
        message: "No log entries found in the file",
        analysis: {
          totalRequests: 0,
          uniqueEndpoints: 0,
          uniqueIPs: 0,
          uniqueUsers: 0,
          uniqueDevices: 0,
          topEndpoints: [],
          endpointsByResponseTime: [],
          endpointsByErrorRate: [],
        },
      })
    }

    // Transform records to LogEntry format
    const logs: LogEntry[] = records.map((record: any) => ({
      timestamp: record.createdAt || new Date().toISOString(),
      ip: record.ip || "unknown",
      endpoint: record.requestEndPoint || "unknown",
      statusCode: Number.parseInt(record.responseCode, 10) || 0,
      responseTime: Number.parseInt(record.responseTime, 10) || 0,
      userAgent: record.userAgent || "",
      method: record.method || "GET",
      username: record.username || "",
      deviceId: record.deviceId || "",
      requestBody: record.requestBody || "",
      responseBody: record.responseBody || "",
    }))

    // Analyze logs
    const analysis = analyzeApiLogs(logs)

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${logs.length} log entries`,
      analysis,
    })
  } catch (error) {
    console.error("Error processing CSV:", error)
    return NextResponse.json(
      { error: "Failed to process CSV file", details: (error as Error).message },
      { status: 500 },
    )
  }
}

interface EndpointAnalysis {
  endpoint: string
  count: number
  avgResponseTime: number
  successRate: number
  methods: Record<string, number>
  users: number
  devices: number
}

interface ApiLogAnalysis {
  totalRequests: number
  uniqueEndpoints: number
  uniqueIPs: number
  uniqueUsers: number
  uniqueDevices: number
  topEndpoints: EndpointAnalysis[]
  endpointsByResponseTime: EndpointAnalysis[]
  endpointsByErrorRate: EndpointAnalysis[]
}

function analyzeApiLogs(logs: LogEntry[]): ApiLogAnalysis {
  // Count total requests
  const totalRequests = logs.length || 0

  // Get unique values
  const uniqueEndpoints = new Set(logs.map((log) => log.endpoint)).size || 0
  const uniqueIPs = new Set(logs.map((log) => log.ip)).size || 0
  const uniqueUsers = new Set(logs.filter((log) => log.username).map((log) => log.username)).size || 0
  const uniqueDevices = new Set(logs.filter((log) => log.deviceId).map((log) => log.deviceId)).size || 0

  // Analyze endpoints
  const endpointMap = new Map<string, EndpointAnalysis>()

  logs.forEach((log) => {
    const endpoint = log.endpoint || "unknown"
    const current = endpointMap.get(endpoint) || {
      endpoint,
      count: 0,
      avgResponseTime: 0,
      successRate: 0,
      methods: {},
      users: 0,
      devices: 0,
      uniqueUsers: new Set<string>(),
      uniqueDevices: new Set<string>(),
    }

    // Update count
    current.count += 1

    // Update response time
    const totalTime = current.avgResponseTime * (current.count - 1)
    current.avgResponseTime = (totalTime + (log.responseTime || 0)) / current.count

    // Update success rate
    const isSuccess = log.statusCode >= 200 && log.statusCode < 400
    const successCount = (current.successRate * (current.count - 1)) / 100
    current.successRate = ((successCount + (isSuccess ? 1 : 0)) / current.count) * 100

    // Update methods
    const method = log.method || "GET"
    current.methods = { ...current.methods, [method]: (current.methods[method] || 0) + 1 }

    // Track unique users and devices
    if (log.username) {
      current.uniqueUsers.add(log.username)
    }
    if (log.deviceId) {
      current.uniqueDevices.add(log.deviceId)
    }

    endpointMap.set(endpoint, current)
  })

  // Convert to array and calculate final metrics
  const endpointAnalysis = Array.from(endpointMap.values()).map((endpoint) => {
    const { uniqueUsers, uniqueDevices, ...rest } = endpoint as any
    return {
      ...rest,
      users: uniqueUsers.size || 0,
      devices: uniqueDevices.size || 0,
    }
  })

  // Sort by different metrics
  const topEndpoints = [...endpointAnalysis].sort((a, b) => b.count - a.count).slice(0, 20)
  const endpointsByResponseTime = [...endpointAnalysis]
    .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
    .slice(0, 10)
  const endpointsByErrorRate = [...endpointAnalysis]
    .filter((endpoint) => endpoint.count > 10) // Filter out endpoints with few requests
    .sort((a, b) => a.successRate - b.successRate)
    .slice(0, 10)

  // Ensure we have at least empty arrays if no data
  return {
    totalRequests,
    uniqueEndpoints,
    uniqueIPs,
    uniqueUsers,
    uniqueDevices,
    topEndpoints: topEndpoints.length ? topEndpoints : [],
    endpointsByResponseTime: endpointsByResponseTime.length ? endpointsByResponseTime : [],
    endpointsByErrorRate: endpointsByErrorRate.length ? endpointsByErrorRate : [],
  }
}
