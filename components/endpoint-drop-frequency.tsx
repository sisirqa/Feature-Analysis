"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, registerables } from "chart.js"
import type { LogEntry } from "@/services/log-analysis-service"

Chart.register(...registerables)

interface EndpointDropFrequencyProps {
  logs: LogEntry[]
  endpoint: string
}

export default function EndpointDropFrequency({ logs, endpoint }: EndpointDropFrequencyProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Filter logs for the specific endpoint
    const endpointLogs = logs.filter((log) => log.endpoint === endpoint)

    // Count logs by status code
    const statusCounts = new Map<number, number>()
    endpointLogs.forEach((log) => {
      const status = log.statusCode
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1)
    })

    // Group status codes
    const statusGroups = {
      "2xx (Success)": 0,
      "3xx (Redirect)": 0,
      "4xx (Client Error)": 0,
      "5xx (Server Error)": 0,
    }

    statusCounts.forEach((count, status) => {
      if (status >= 200 && status < 300) {
        statusGroups["2xx (Success)"] += count
      } else if (status >= 300 && status < 400) {
        statusGroups["3xx (Redirect)"] += count
      } else if (status >= 400 && status < 500) {
        statusGroups["4xx (Client Error)"] += count
      } else if (status >= 500 && status < 600) {
        statusGroups["5xx (Server Error)"] += count
      }
    })

    // Calculate percentages
    const total = endpointLogs.length
    const percentages = Object.entries(statusGroups).map(([group, count]) => ({
      group,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))

    // Colors for status groups
    const colors = {
      "2xx (Success)": "rgba(16, 185, 129, 0.7)",
      "3xx (Redirect)": "rgba(59, 130, 246, 0.7)",
      "4xx (Client Error)": "rgba(245, 158, 11, 0.7)",
      "5xx (Server Error)": "rgba(239, 68, 68, 0.7)",
    }

    // Create chart
    chartInstance.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: Object.keys(statusGroups),
        datasets: [
          {
            data: Object.values(statusGroups),
            backgroundColor: Object.keys(statusGroups).map((group) => colors[group as keyof typeof colors]),
            borderColor: Object.keys(statusGroups).map((group) =>
              colors[group as keyof typeof colors].replace("0.7", "1"),
            ),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Status Code Distribution for ${endpoint}`,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.raw as number
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0"
                return `${label}: ${value} (${percentage}%)`
              },
            },
          },
          legend: {
            position: "right",
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [logs, endpoint])

  // Calculate drop frequency
  const endpointLogs = logs.filter((log) => log.endpoint === endpoint)
  const total = endpointLogs.length
  const failures = endpointLogs.filter((log) => log.statusCode >= 400).length
  const dropFrequency = total > 0 ? (failures / total) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drop Frequency Analysis</CardTitle>
        <CardDescription>
          Overall drop rate:{" "}
          <span
            className={`font-bold ${dropFrequency < 5 ? "text-green-600" : dropFrequency < 10 ? "text-yellow-600" : "text-red-600"}`}
          >
            {dropFrequency.toFixed(1)}%
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  )
}
