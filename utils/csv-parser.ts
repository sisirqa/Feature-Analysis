import { parse } from "csv-parse/sync"

export interface ApiLogRecord {
  id: string
  _id: string
  ip: string
  userAgent: string
  requestBody: string
  requestEndPoint: string
  responseCode: string
  responseTime: string
  responseBody: string
  createdAt: string
  updatedAt: string
  username: string
  method: string
  deviceId: string
}

export function parseApiLogCsv(csvContent: string): ApiLogRecord[] {
  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    return records as ApiLogRecord[]
  } catch (error) {
    console.error("Error parsing CSV:", error)
    throw new Error(`Failed to parse CSV: ${(error as Error).message}`)
  }
}

export function extractEndpointPath(endpoint: string): string {
  try {
    // Remove query parameters
    const path = endpoint.split("?")[0]

    // Extract the path pattern by replacing IDs with placeholders
    // This helps group similar endpoints like /api/v1/products/123 and /api/v1/products/456
    return path.replace(/\/[0-9a-f]{8,}(?:-[0-9a-f]{4,}){3,}-[0-9a-f]{12,}/gi, "/:id").replace(/\/\d+/g, "/:id")
  } catch (error) {
    return endpoint
  }
}

export function groupEndpoints(logs: ApiLogRecord[]): Record<string, number> {
  const endpointCounts: Record<string, number> = {}

  logs.forEach((log) => {
    const endpoint = extractEndpointPath(log.requestEndPoint)
    endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1
  })

  return endpointCounts
}
