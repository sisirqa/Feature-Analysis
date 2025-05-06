"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, registerables } from "chart.js"
import type { LogEntry } from "@/services/log-analysis-service"

Chart.register(...registerables)

interface EndpointDailyTrendProps {
  logs: LogEntry[]
  endpoint: string
  days?: number
}

export default function EndpointDailyTrend({ logs, endpoint, days = 30 }: EndpointDailyTrendProps) {
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

    // Generate dates for the last N days
    const today = new Date()
    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (days - 1) + i)
      return date.toISOString().split("T")[0]
    })

    // Count logs by date
    const dateCounts = new Map<string, number>()
    dates.forEach((date) => dateCounts.set(date, 0))

    endpointLogs.forEach((log) => {
      const date = new Date(log.timestamp).toISOString().split("T")[0]
      if (dateCounts.has(date)) {
        dateCounts.set(date, (dateCounts.get(date) || 0) + 1)
      }
    })

    // Count success and failure by date
    const successCounts = new Map<string, number>()
    const failureCounts = new Map<string, number>()

    dates.forEach((date) => {
      successCounts.set(date, 0)
      failureCounts.set(date, 0)
    })

    endpointLogs.forEach((log) => {
      const date = new Date(log.timestamp).toISOString().split("T")[0]
      if (!successCounts.has(date)) return

      if (log.statusCode >= 200 && log.statusCode < 400) {
        successCounts.set(date, (successCounts.get(date) || 0) + 1)
      } else {
        failureCounts.set(date, (failureCounts.get(date) || 0) + 1)
      }
    })

    // Format dates for display
    const formattedDates = dates.map((date) => {
      const [year, month, day] = date.split("-")
      return `${month}/${day}`
    })

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: formattedDates,
        datasets: [
          {
            label: "Total Requests",
            data: dates.map((date) => dateCounts.get(date) || 0),
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 2,
            fill: true,
            tension: 0.2,
          },
          {
            label: "Success Rate",
            data: dates.map((date) => {
              const total = dateCounts.get(date) || 0
              const success = successCounts.get(date) || 0
              return total > 0 ? (success / total) * 100 : 0
            }),
            backgroundColor: "rgba(16, 185, 129, 0.0)",
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.2,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Number of Requests",
            },
          },
          y1: {
            beginAtZero: true,
            max: 100,
            position: "right",
            title: {
              display: true,
              text: "Success Rate (%)",
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          x: {
            title: {
              display: true,
              text: "Date",
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: `Daily Trend for ${endpoint}`,
          },
          tooltip: {
            callbacks: {
              afterLabel: (context) => {
                const datasetIndex = context.datasetIndex
                const index = context.dataIndex
                const date = dates[index]

                if (datasetIndex === 0) {
                  // Total
                  const success = successCounts.get(date) || 0
                  const failure = failureCounts.get(date) || 0
                  return [`Success: ${success}`, `Failure: ${failure}`]
                }
                return ""
              },
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [logs, endpoint, days])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Trend</CardTitle>
        <CardDescription>Request volume and success rate over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  )
}
