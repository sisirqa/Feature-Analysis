"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { DailyUsage } from "@/services/log-analysis-service"

Chart.register(...registerables)

interface LogAnalysisChartProps {
  data: DailyUsage[]
  title: string
  color?: string
}

export default function LogAnalysisChart({ data, title, color = "rgba(54, 162, 235, 0.7)" }: LogAnalysisChartProps) {
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

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((item) => item.date),
        datasets: [
          {
            label: "Requests",
            data: data.map((item) => item.count),
            backgroundColor: color,
            borderColor: color.replace("0.7", "1"),
            borderWidth: 1,
            tension: 0.3,
            fill: true,
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
              text: "Date",
            },
            ticks: {
              maxTicksLimit: 10,
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: title,
          },
          legend: {
            display: false,
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, title, color])

  return (
    <div className="w-full h-[300px]">
      <canvas ref={chartRef} />
    </div>
  )
}
