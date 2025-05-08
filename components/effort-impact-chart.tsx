"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { ChartData, FeatureReport } from "@/types/report-types"

Chart.register(...registerables)

interface EffortImpactChartProps {
  data?: ChartData[]
  features?: FeatureReport[]
}

export default function EffortImpactChart({ data, features }: EffortImpactChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const hasRendered = useRef(false)

  useEffect(() => {
    if (!chartRef.current) return
    if (hasRendered.current) return // Prevent re-rendering if already rendered

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Handle the case where data is undefined
    let chartData: ChartData[] = []

    if (data && data.length > 0) {
      chartData = data
    } else if (features && features.length > 0) {
      // Convert features to chart data
      chartData = features.map((feature) => ({
        name: feature.name,
        effort: feature.effort,
        impact: feature.impact,
      }))
    } else {
      // Render empty state
      ctx.font = "16px Arial"
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.textAlign = "center"
      ctx.fillText("No data available", chartRef.current.width / 2, chartRef.current.height / 2)
      hasRendered.current = true
      return
    }

    chartInstance.current = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Features",
            data: chartData.map((item) => ({
              x: item.effort,
              y: item.impact,
            })),
            backgroundColor: "rgba(54, 162, 235, 0.7)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
            pointRadius: 8,
            pointHoverRadius: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Effort (1-10)",
            },
            min: 0,
            max: 10,
            ticks: {
              stepSize: 1,
            },
          },
          y: {
            title: {
              display: true,
              text: "Impact (1-10)",
            },
            min: 0,
            max: 10,
            ticks: {
              stepSize: 1,
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const index = context.dataIndex
                return `${chartData[index].name}: Impact ${chartData[index].impact}, Effort ${chartData[index].effort}`
              },
            },
          },
          legend: {
            display: false,
          },
        },
      },
    })

    // Add quadrant labels
    ctx.font = "14px Arial"
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillText("Quick Wins", chartRef.current.width * 0.25, chartRef.current.height * 0.15)
    ctx.fillText("Major Projects", chartRef.current.width * 0.75, chartRef.current.height * 0.15)
    ctx.fillText("Low Priority", chartRef.current.width * 0.25, chartRef.current.height * 0.85)
    ctx.fillText("Thankless Tasks", chartRef.current.width * 0.75, chartRef.current.height * 0.85)

    // Add quadrant lines
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(chartRef.current.width / 2, 0)
    ctx.lineTo(chartRef.current.width / 2, chartRef.current.height)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, chartRef.current.height / 2)
    ctx.lineTo(chartRef.current.width, chartRef.current.height / 2)
    ctx.stroke()

    hasRendered.current = true

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
        hasRendered.current = false
      }
    }
  }, [data, features])

  return (
    <div className="w-full h-[300px]">
      <canvas ref={chartRef} />
    </div>
  )
}
