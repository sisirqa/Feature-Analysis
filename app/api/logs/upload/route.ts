import { type NextRequest, NextResponse } from "next/server"
import { parse } from "csv-parse/sync"
import type { LogEntry } from "@/services/log-analysis-service"

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    // Check if the request is a FormData request
    const contentType = request.headers.get("content-type") || ""

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Request must be multipart/form-data" }, { status: 400 })
    }

    // Parse the form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (error) {
      console.error("Error parsing form data:", error)
      return NextResponse.json(
        { error: "Failed to parse form data", details: (error as Error).message },
        { status: 400 },
      )
    }

    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 })
    }

    // Read file content
    let fileContent: string
    try {
      fileContent = await file.text()
    } catch (error) {
      console.error("Error reading file content:", error)
      return NextResponse.json(
        { error: "Failed to read file content", details: (error as Error).message },
        { status: 400 },
      )
    }

    // Parse CSV
    let records: any[]
    try {
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true, // Allow varying column counts
        skip_records_with_error: true, // Skip records with errors
      })
    } catch (error) {
      console.error("Error parsing CSV:", error)
      return NextResponse.json(
        { error: "Failed to parse CSV file", details: (error as Error).message },
        { status: 400 },
      )
    }

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

    // Transform records to LogEntry format with error handling for each record
    const logs: LogEntry[] = []

    for (const record of records) {
      try {
        // Determine the endpoint field name (could be requestEndPoint, request_path, url, etc.)
        const endpoint =
          record.requestEndPoint || record.request_path || record.url || record.endpoint || record.path || "unknown"

        // Determine the status code field name
        const statusCode = Number.parseInt(record.responseCode || record.status_code || record.status || "200", 10)

        // Determine the response time field name
        const responseTime = Number.parseInt(record.responseTime || record.response_time || record.duration || "0", 10)

        // Create the log entry with flexible field mapping
        logs.push({
          timestamp: record.createdAt || record.timestamp || record.created_at || new Date().toISOString(),
          ip: record.ip || record.public_ip || record.clientIp || "unknown",
          endpoint,
          statusCode: isNaN(statusCode) ? 200 : statusCode,
          responseTime: isNaN(responseTime) ? 0 : responseTime,
          userAgent: record.userAgent || record.user_agent || "",
          method: record.method || record.request_method || "GET",
          username: record.username || record.user || "",
          deviceId: record.deviceId || record.device_id || "",
          requestBody: record.requestBody || record.request_body || "",
          responseBody: record.responseBody || record.response_body || "",
        })
      } catch (error) {
        console.error("Error processing record:", error, record)
        // Skip this record and continue with the next one
      }
    }

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
      {
        error: "Failed to process CSV file",
        details: (error as Error).message,
        success: false,
      },
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
