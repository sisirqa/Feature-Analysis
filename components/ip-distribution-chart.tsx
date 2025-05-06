"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { IPDistribution } from "@/services/log-analysis-service"

Chart.register(...registerables)

interface IPDistributionChartProps {
  data: IPDistribution[]
}

export default function IPDistributionChart({ data }: IPDistributionChartProps) {
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

    // Group by region
    const regionMap = new Map<string, number>()
    data.forEach((item) => {
      const region = item.region || "Unknown"
      const current = regionMap.get(region) || 0
      regionMap.set(region, current + item.count)
    })

    // Convert to array and sort by count
    const regionData = Array.from(regionMap.entries())
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)

    // Prepare data for chart
    const labels = regionData.map((item) => item.region)
    const counts = regionData.map((item) => item.count)

    // Generate colors
    const backgroundColors = regionData.map((_, index) => {
      const hue = (index * 60) % 360
      return `hsla(${hue}, 70%, 60%, 0.7)`
    })

    const borderColors = backgroundColors.map((color) => color.replace("0.7", "1"))

    chartInstance.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
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
        plugins: {
          title: {
            display: true,
            text: "User Distribution by Region",
          },
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
