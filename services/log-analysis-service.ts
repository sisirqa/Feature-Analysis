export interface LogEntry {
  timestamp: string
  ip: string
  endpoint: string
  statusCode: number
  responseTime: number
  userAgent: string
  method: string
  username: string
  deviceId: string
  requestBody: string
  responseBody: string
}

export interface EndpointUsage {
  endpoint: string
  count: number
  avgResponseTime: number
  successRate: number
}

export interface IPDistribution {
  region: string
  count: number
}

export interface DailyUsage {
  date: string
  count: number
}

export interface LogAnalysisResult {
  totalRequests: number
  uniqueIPs: number
  uniqueEndpoints: number
  topEndpoints: EndpointUsage[]
  dailyUsage: DailyUsage[]
  ipDistribution: IPDistribution[]
  endpointTrends: { endpoint: string; usage: DailyUsage[] }[]
  uniqueUsers: number
}

export function generateSampleLogs(days = 30, count = 500): LogEntry[] {
  const sampleLogs: LogEntry[] = []
  const endpoints = [
    "/auth/register",
    "/auth/login",
    "/products",
    "/recommendations",
    "/users/profile",
    "/users/follows",
    "/saved-items",
  ]

  const methods = {
    "/auth/register": "POST",
    "/auth/login": "POST",
    "/products": "GET",
    "/recommendations": ["GET", "POST"],
    "/users/profile": "GET",
    "/users/follows": ["GET", "POST"],
    "/saved-items": ["GET", "POST", "DELETE"],
  }

  // Generate sample log entries
  for (let i = 0; i < count; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * days))
    date.setHours(Math.floor(Math.random() * 24))

    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
    const methodOptions = methods[endpoint as keyof typeof methods]
    const method = Array.isArray(methodOptions)
      ? methodOptions[Math.floor(Math.random() * methodOptions.length)]
      : methodOptions

    const statusCode = Math.random() > 0.9 ? (Math.random() > 0.5 ? 400 : 500) : 200
    const responseTime = Math.floor(Math.random() * 500) + 50

    sampleLogs.push({
      timestamp: date.toISOString(),
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      endpoint,
      statusCode,
      responseTime,
      userAgent: "Mozilla/5.0",
      method,
      username: `user${Math.floor(Math.random() * 100)}`,
      deviceId: `device${Math.floor(Math.random() * 50)}`,
      requestBody: "",
      responseBody: "",
    })
  }

  return sampleLogs
}

export async function analyzeAccessLogs(logs: LogEntry[]): Promise<LogAnalysisResult> {
  const totalRequests = logs.length
  const uniqueIPs = new Set(logs.map((log) => log.ip)).size
  const uniqueEndpoints = new Set(logs.map((log) => log.endpoint)).size
  const uniqueUsers = new Set(logs.filter((log) => log.username).map((log) => log.username)).size

  const endpointUsage = analyzeEndpointUsage(logs)

  const dailyUsage = calculateDailyUsage(logs)
  const ipDistribution = calculateIPDistribution(logs)
  const endpointTrends = calculateEndpointTrends(logs)

  return {
    totalRequests,
    uniqueIPs,
    uniqueEndpoints,
    topEndpoints: endpointUsage,
    dailyUsage,
    ipDistribution,
    endpointTrends,
    uniqueUsers,
  }
}

export function analyzeEndpointUsage(logs: LogEntry[]): EndpointUsage[] {
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

  const endpointUsage: EndpointUsage[] = Array.from(endpointMap.entries())
    .map(([endpoint, data]) => ({
      endpoint,
      count: data.count,
      avgResponseTime: data.totalResponseTime / data.count,
      successRate: (data.successCount / data.count) * 100,
    }))
    .sort((a, b) => b.count - a.count)

  return endpointUsage
}

function calculateDailyUsage(logs: LogEntry[]): DailyUsage[] {
  const dailyUsageMap = new Map<string, number>()

  logs.forEach((log) => {
    const date = log.timestamp.split("T")[0]
    dailyUsageMap.set(date, (dailyUsageMap.get(date) || 0) + 1)
  })

  const dailyUsage: DailyUsage[] = Array.from(dailyUsageMap.entries()).map(([date, count]) => ({
    date,
    count,
  }))

  return dailyUsage
}

function calculateIPDistribution(logs: LogEntry[]): IPDistribution[] {
  const ipDistributionMap = new Map<string, number>()

  logs.forEach((log) => {
    ipDistributionMap.set(log.ip, (ipDistributionMap.get(log.ip) || 0) + 1)
  })

  const ipDistribution: IPDistribution[] = Array.from(ipDistributionMap.entries()).map(([ip, count]) => ({
    region: ip, // Replace with actual region lookup if available
    count,
  }))

  return ipDistribution
}

function calculateEndpointTrends(logs: LogEntry[]): { endpoint: string; usage: DailyUsage[] }[] {
  const endpoints = [...new Set(logs.map((log) => log.endpoint))]
  return endpoints.map((endpoint) => ({
    endpoint,
    usage: calculateDailyUsage(logs.filter((log) => log.endpoint === endpoint)),
  }))
}

export type { IPDistribution, DailyUsage, LogAnalysisResult }
