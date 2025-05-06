"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Search, AlertTriangle, Clock, BarChart2 } from "lucide-react"
import type { LogEntry } from "@/services/log-analysis-service"

interface EndpointStatistic {
  endpoint: string
  count: number
  successCount: number
  failureCount: number
  dailyFrequency: number
  hourlyFrequency: number
  dropFrequency: number
  avgResponseTime: number
  peakHour: number
  lastSeen: string
}

interface EndpointStatisticsTableProps {
  logs: LogEntry[]
  daysInSample: number
  onEndpointSelect?: (endpoint: string) => void
}

export default function EndpointStatisticsTable({
  logs,
  daysInSample,
  onEndpointSelect,
}: EndpointStatisticsTableProps) {
  const [sortField, setSortField] = useState<keyof EndpointStatistic>("count")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [searchQuery, setSearchQuery] = useState("")

  // Calculate statistics for each endpoint
  const endpointStats = useMemo(() => {
    // Group logs by endpoint
    const endpointMap = new Map<string, LogEntry[]>()
    logs.forEach((log) => {
      const endpoint = log.endpoint
      if (!endpointMap.has(endpoint)) {
        endpointMap.set(endpoint, [])
      }
      endpointMap.get(endpoint)?.push(log)
    })

    // Calculate statistics for each endpoint
    const stats: EndpointStatistic[] = []

    endpointMap.forEach((endpointLogs, endpoint) => {
      const count = endpointLogs.length

      // Calculate success and failure counts
      const successCount = endpointLogs.filter((log) => log.statusCode >= 200 && log.statusCode < 400).length
      const failureCount = count - successCount

      // Calculate frequencies
      const dailyFrequency = count / daysInSample
      const hourlyFrequency = dailyFrequency / 24

      // Calculate drop frequency (failure rate)
      const dropFrequency = (failureCount / count) * 100

      // Calculate average response time
      const totalResponseTime = endpointLogs.reduce((sum, log) => sum + log.responseTime, 0)
      const avgResponseTime = totalResponseTime / count

      // Find peak hour
      const hourCounts = new Array(24).fill(0)
      endpointLogs.forEach((log) => {
        const hour = new Date(log.timestamp).getHours()
        hourCounts[hour]++
      })
      const peakHour = hourCounts.indexOf(Math.max(...hourCounts))

      // Find last seen
      const timestamps = endpointLogs.map((log) => new Date(log.timestamp).getTime())
      const lastSeen = new Date(Math.max(...timestamps)).toISOString()

      stats.push({
        endpoint,
        count,
        successCount,
        failureCount,
        dailyFrequency,
        hourlyFrequency,
        dropFrequency,
        avgResponseTime,
        peakHour,
        lastSeen,
      })
    })

    return stats
  }, [logs, daysInSample])

  // Sort and filter the statistics
  const sortedAndFilteredStats = useMemo(() => {
    return endpointStats
      .filter((stat) => stat.endpoint.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        return 0
      })
  }, [endpointStats, sortField, sortDirection, searchQuery])

  const handleSort = (field: keyof EndpointStatistic) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const formatFrequency = (frequency: number) => {
    if (frequency < 1) {
      return frequency.toFixed(2)
    }
    return Math.round(frequency).toLocaleString()
  }

  const getDropFrequencyColor = (dropFrequency: number) => {
    if (dropFrequency < 1) return "bg-green-100 text-green-800"
    if (dropFrequency < 5) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen)
    return date.toLocaleString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>API Endpoint Statistics</span>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search endpoints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
        </CardTitle>
        <CardDescription>
          Detailed statistics for {sortedAndFilteredStats.length} API endpoints over {daysInSample} days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  <Button variant="ghost" onClick={() => handleSort("endpoint")} className="flex items-center gap-1">
                    Endpoint <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("count")} className="flex items-center gap-1">
                    Count <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("dailyFrequency")}
                    className="flex items-center gap-1"
                  >
                    Daily <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("hourlyFrequency")}
                    className="flex items-center gap-1"
                  >
                    Hourly <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("dropFrequency")}
                    className="flex items-center gap-1"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" /> Drop % <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("avgResponseTime")}
                    className="flex items-center gap-1"
                  >
                    Avg Time <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("peakHour")} className="flex items-center gap-1">
                    <Clock className="h-3 w-3 mr-1" /> Peak Hour <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                {onEndpointSelect && (
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredStats.map((stat, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium truncate max-w-[300px]" title={stat.endpoint}>
                    {stat.endpoint}
                  </TableCell>
                  <TableCell>{stat.count.toLocaleString()}</TableCell>
                  <TableCell>{formatFrequency(stat.dailyFrequency)}</TableCell>
                  <TableCell>{formatFrequency(stat.hourlyFrequency)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getDropFrequencyColor(stat.dropFrequency)}>
                      {stat.dropFrequency.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>{stat.avgResponseTime.toFixed(0)} ms</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="mr-1">{stat.peakHour}:00</span>
                      <div className="w-16 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(stat.peakHour / 24) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  {onEndpointSelect && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEndpointSelect(stat.endpoint)}
                        className="flex items-center gap-1"
                      >
                        <BarChart2 className="h-4 w-4" />
                        <span>Analyze</span>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {sortedAndFilteredStats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={onEndpointSelect ? 8 : 7} className="text-center py-4 text-muted-foreground">
                    No endpoints found matching your search
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
