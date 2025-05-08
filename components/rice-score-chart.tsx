"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { FeatureData, FeatureReport } from "@/types/report-types"

Chart.register(...registerables)

interface RiceScoreChartProps {
  data?: FeatureData[]
  features?: FeatureReport[]
}

export default function RiceScoreChart({ data, features }: RiceScoreChartProps) {
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
    let chartData: FeatureData[] = []

    if (data && data.length > 0) {
      chartData = data
    } else if (features && features.length > 0) {
      // Convert features to chart data
      chartData = features.map((feature) => ({
        name: feature.name,
        reach: feature.impact, // Use impact as reach if not available
        impact: feature.impact,
        confidence: feature.confidence || 7, // Default confidence if not available
        effort: feature.effort,
        riceScore: feature.riceScore,
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

    // Sort data by RICE score in descending order
    const sortedData = [...chartData].sort((a, b) => b.riceScore - a.riceScore)

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: sortedData.map((item) => item.name),
        datasets: [
          {
            label: "RICE Score",
            data: sortedData.map((item) => item.riceScore),
            backgroundColor: [
              "rgba(54, 162, 235, 0.7)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(153, 102, 255, 0.7)",
              "rgba(255, 159, 64, 0.7)",
              "rgba(255, 99, 132, 0.7)",
            ],
            borderColor: [
              "rgba(54, 162, 235, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
              "rgba(255, 99, 132, 1)",
            ],
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
              text: "RICE Score",
            },
          },
          x: {
            title: {
              display: true,
              text: "Features",
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              afterLabel: (context) => {
                const index = context.dataIndex
                const feature = sortedData[index]
                return [
                  `Reach: ${feature.reach}`,
                  `Impact: ${feature.impact}`,
                  `Confidence: ${feature.confidence}`,
                  `Effort: ${feature.effort}`,
                ]
              },
            },
          },
          legend: {
            display: false,
          },
        },
      },
    })

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
