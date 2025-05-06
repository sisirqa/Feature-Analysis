export interface LogEntry {
  timestamp: string
  ip: string
  endpoint: string
  statusCode: number
  responseTime: number
  userAgent?: string
}

export interface EndpointUsage {
  endpoint: string
  count: number
  avgResponseTime: number
  successRate: number
}

export interface DailyUsage {
  date: string
  count: number
}

export interface IPDistribution {
  ip: string
  count: number
  region?: string
}

export interface LogAnalysisResult {
  totalRequests: number
  uniqueIPs: number
  uniqueEndpoints: number
  topEndpoints: EndpointUsage[]
  dailyUsage: DailyUsage[]
  ipDistribution: IPDistribution[]
  endpointTrends: {
    endpoint: string
    usage: DailyUsage[]
  }[]
}

export async function analyzeAccessLogs(logs: LogEntry[]): Promise<LogAnalysisResult> {
  // Count total requests
  const totalRequests = logs.length

  // Count unique IPs
  const uniqueIPs = new Set(logs.map((log) => log.ip)).size

  // Count unique endpoints
  const uniqueEndpoints = new Set(logs.map((log) => log.endpoint)).size

  // Calculate endpoint usage
  const endpointMap = new Map<string, { count: number; totalResponseTime: number; successCount: number }>()

  logs.forEach((log) => {
    const endpoint = log.endpoint
    const current = endpointMap.get(endpoint) || { count: 0, totalResponseTime: 0, successCount: 0 }

    current.count += 1
    current.totalResponseTime += log.responseTime
    if (log.statusCode >= 200 && log.statusCode < 400) {
      current.successCount += 1
    }

    endpointMap.set(endpoint, current)
  })

  // Convert to array and sort by count
  const topEndpoints: EndpointUsage[] = Array.from(endpointMap.entries())
    .map(([endpoint, data]) => ({
      endpoint,
      count: data.count,
      avgResponseTime: data.totalResponseTime / data.count,
      successRate: (data.successCount / data.count) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Calculate daily usage
  const dailyUsageMap = new Map<string, number>()

  logs.forEach((log) => {
    const date = log.timestamp.split("T")[0]
    const current = dailyUsageMap.get(date) || 0
    dailyUsageMap.set(date, current + 1)
  })

  // Convert to array and sort by date
  const dailyUsage: DailyUsage[] = Array.from(dailyUsageMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Calculate IP distribution
  const ipMap = new Map<string, number>()

  logs.forEach((log) => {
    const ip = log.ip
    const current = ipMap.get(ip) || 0
    ipMap.set(ip, current + 1)
  })

  // Convert to array and sort by count
  const ipDistribution: IPDistribution[] = Array.from(ipMap.entries())
    .map(([ip, count]) => ({ ip, count, region: getRegionFromIP(ip) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  // Calculate endpoint trends over time
  const endpointTrends = topEndpoints.slice(0, 5).map((endpoint) => {
    const endpointLogs = logs.filter((log) => log.endpoint === endpoint.endpoint)
    const usageMap = new Map<string, number>()

    endpointLogs.forEach((log) => {
      const date = log.timestamp.split("T")[0]
      const current = usageMap.get(date) || 0
      usageMap.set(date, current + 1)
    })

    const usage: DailyUsage[] = Array.from(usageMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
      endpoint: endpoint.endpoint,
      usage,
    }
  })

  return {
    totalRequests,
    uniqueIPs,
    uniqueEndpoints,
    topEndpoints,
    dailyUsage,
    ipDistribution,
    endpointTrends,
  }
}

// Helper function to get region from IP (simplified mock)
function getRegionFromIP(ip: string): string {
  // In a real implementation, this would use a geolocation service
  // For this example, we'll return mock data
  const ipFirstOctet = Number.parseInt(ip.split(".")[0])

  if (ipFirstOctet < 100) return "North America"
  if (ipFirstOctet < 150) return "Europe"
  if (ipFirstOctet < 200) return "Asia"
  return "Other"
}

// Function to generate sample log data for testing
export function generateSampleLogs(days = 30, entriesPerDay = 100): LogEntry[] {
  const logs: LogEntry[] = []
  const endpoints = [
    "/api/users",
    "/api/transactions",
    "/api/auth/login",
    "/api/auth/logout",
    "/api/products",
    "/api/orders",
    "/api/payments",
    "/api/reports",
    "/api/settings",
    "/api/notifications",
  ]

  const statusCodes = [200, 200, 200, 200, 201, 400, 401, 403, 404, 500]

  // Generate IPs (simplified)
  const ips: string[] = []
  for (let i = 0; i < 50; i++) {
    const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    ips.push(ip)
  }

  // Generate logs for each day
  const today = new Date()
  for (let day = 0; day < days; day++) {
    const date = new Date(today)
    date.setDate(date.getDate() - day)
    const dateStr = date.toISOString().split("T")[0]

    for (let i = 0; i < entriesPerDay; i++) {
      const hour = Math.floor(Math.random() * 24)
      const minute = Math.floor(Math.random() * 60)
      const second = Math.floor(Math.random() * 60)
      const timestamp = `${dateStr}T${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}Z`

      // Weight endpoints to simulate some being more popular
      let endpointIndex
      const rand = Math.random()
      if (rand < 0.3) {
        endpointIndex = 0 // /api/users is most popular
      } else if (rand < 0.5) {
        endpointIndex = 1 // /api/transactions is second most popular
      } else if (rand < 0.7) {
        endpointIndex = 2 // /api/auth/login is third most popular
      } else {
        endpointIndex = Math.floor(Math.random() * endpoints.length)
      }

      const endpoint = endpoints[endpointIndex]
      const ip = ips[Math.floor(Math.random() * ips.length)]
      const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)]
      const responseTime = Math.floor(Math.random() * 500) + 50 // 50-550ms

      logs.push({
        timestamp,
        ip,
        endpoint,
        statusCode,
        responseTime,
      })
    }
  }

  return logs
}
