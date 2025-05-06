"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { EndpointUsage } from "@/services/log-analysis-service"

Chart.register(...registerables)

interface EndpointUsageChartProps {
  data: EndpointUsage[]
}

export default function EndpointUsageChart({ data }: EndpointUsageChartProps) {
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

    // Sort data by count in descending order
    const sortedData = [...data].sort((a, b) => b.count - a.count)

    // Prepare data for chart
    const labels = sortedData.map((item) => item.endpoint.replace("/api/", ""))
    const counts = sortedData.map((item) => item.count)
    const responseTimes = sortedData.map((item) => item.avgResponseTime)
    const successRates = sortedData.map((item) => item.successRate)

    // Generate colors
    const backgroundColors = sortedData.map((_, index) => {
      const hue = (index * 30) % 360
      return `hsla(${hue}, 70%, 60%, 0.7)`
    })

    const borderColors = backgroundColors.map((color) => color.replace("0.7", "1"))

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Requests",
            data: counts,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Number of Requests",
            },
          },
          y: {
            title: {
              display: true,
              text: "Endpoint",
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: "Top Endpoints by Usage",
          },
          tooltip: {
            callbacks: {
              afterLabel: (context) => {
                const index = context.dataIndex
                return [
                  `Avg Response Time: ${responseTimes[index].toFixed(2)}ms`,
                  `Success Rate: ${successRates[index].toFixed(1)}%`,
                ]
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
  }, [data])

  return (
    <div className="w-full h-[400px]">
      <canvas ref={chartRef} />
    </div>
  )
}
