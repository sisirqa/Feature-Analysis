"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart, registerables } from "chart.js"
import type { LogEntry } from "@/services/log-analysis-service"

Chart.register(...registerables)

interface EndpointHourlyDistributionProps {
  logs: LogEntry[]
  endpoint: string
}

export default function EndpointHourlyDistribution({ logs, endpoint }: EndpointHourlyDistributionProps) {
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

    // Count logs by hour
    const hourCounts = new Array(24).fill(0)
    endpointLogs.forEach((log) => {
      const hour = new Date(log.timestamp).getHours()
      hourCounts[hour]++
    })

    // Count success and failure by hour
    const successCounts = new Array(24).fill(0)
    const failureCounts = new Array(24).fill(0)

    endpointLogs.forEach((log) => {
      const hour = new Date(log.timestamp).getHours()
      if (log.statusCode >= 200 && log.statusCode < 400) {
        successCounts[hour]++
      } else {
        failureCounts[hour]++
      }
    })

    // Create labels for hours
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Total Requests",
            data: hourCounts,
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
          },
          {
            label: "Successful Requests",
            data: successCounts,
            backgroundColor: "rgba(16, 185, 129, 0.5)",
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 1,
          },
          {
            label: "Failed Requests",
            data: failureCounts,
            backgroundColor: "rgba(239, 68, 68, 0.5)",
            borderColor: "rgba(239, 68, 68, 1)",
            borderWidth: 1,
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
          x: {
            title: {
              display: true,
              text: "Hour of Day",
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: `Hourly Distribution for ${endpoint}`,
          },
          tooltip: {
            callbacks: {
              afterLabel: (context) => {
                const datasetIndex = context.datasetIndex
                const index = context.dataIndex
                const total = hourCounts[index]

                if (datasetIndex === 1) {
                  // Success
                  const percentage = total > 0 ? ((successCounts[index] / total) * 100).toFixed(1) : "0"
                  return `${percentage}% of total requests`
                } else if (datasetIndex === 2) {
                  // Failure
                  const percentage = total > 0 ? ((failureCounts[index] / total) * 100).toFixed(1) : "0"
                  return `${percentage}% of total requests`
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
  }, [logs, endpoint])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hourly Distribution</CardTitle>
        <CardDescription>Request distribution by hour of day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  )
}
