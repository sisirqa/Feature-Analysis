"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { RiskData } from "@/types/report-types"

Chart.register(...registerables)

interface RiskDistributionChartProps {
  data: RiskData[]
}

export default function RiskDistributionChart({ data }: RiskDistributionChartProps) {
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

    // Count risks by severity
    const severityCounts: Record<string, number> = {}
    data.forEach((risk) => {
      if (!severityCounts[risk.severity]) {
        severityCounts[risk.severity] = 0
      }
      severityCounts[risk.severity]++
    })

    const severities = Object.keys(severityCounts)
    const counts = severities.map((severity) => severityCounts[severity])

    // Define colors based on severity
    const getColorForSeverity = (severity: string) => {
      switch (severity) {
        case "High":
          return { bg: "rgba(255, 99, 132, 0.7)", border: "rgba(255, 99, 132, 1)" }
        case "Medium":
          return { bg: "rgba(255, 159, 64, 0.7)", border: "rgba(255, 159, 64, 1)" }
        case "Low":
          return { bg: "rgba(75, 192, 192, 0.7)", border: "rgba(75, 192, 192, 1)" }
        default:
          return { bg: "rgba(153, 102, 255, 0.7)", border: "rgba(153, 102, 255, 1)" }
      }
    }

    chartInstance.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: severities,
        datasets: [
          {
            data: counts,
            backgroundColor: severities.map((severity) => getColorForSeverity(severity).bg),
            borderColor: severities.map((severity) => getColorForSeverity(severity).border),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.raw as number
                const total = counts.reduce((sum, count) => sum + count, 0)
                const percentage = Math.round((value / total) * 100)
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
  }, [data])

  return (
    <div className="w-full h-[300px]">
      <canvas ref={chartRef} />
    </div>
  )
}
