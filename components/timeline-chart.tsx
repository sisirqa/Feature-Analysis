"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { TimelineData } from "@/types/report-types"

Chart.register(...registerables)

interface TimelineChartProps {
  data?: TimelineData[]
  features?: any[] // Alternative data source
}

export default function TimelineChart({ data, features }: TimelineChartProps) {
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
    const timelineData = data || []

    // If we have features but no data, try to extract timeline data from features
    if ((!timelineData || timelineData.length === 0) && features && features.length > 0) {
      // Create sample timeline data based on features
      const sampleTimelineData = [
        { name: "Planning & Design", duration: "2 weeks", deliverables: "Technical specifications, API design" },
        { name: "Development", duration: "3 weeks", deliverables: "Implementation of core functionality" },
        { name: "Testing", duration: "2 weeks", deliverables: "QA and bug fixes" },
        { name: "Deployment", duration: "1 week", deliverables: "Production release and monitoring" },
      ]

      // Use sample data instead
      renderChart(ctx, sampleTimelineData)
      hasRendered.current = true
      return
    }

    // If we have timeline data, use it
    if (timelineData.length > 0) {
      renderChart(ctx, timelineData)
      hasRendered.current = true
    } else {
      // Render empty state
      ctx.font = "16px Arial"
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.textAlign = "center"
      ctx.fillText("No timeline data available", chartRef.current.width / 2, chartRef.current.height / 2)
      hasRendered.current = true
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
        hasRendered.current = false
      }
    }
  }, [data, features])

  const renderChart = (ctx: CanvasRenderingContext2D, timelineData: TimelineData[]) => {
    // Convert duration strings to numbers (weeks)
    const getDurationInWeeks = (duration: string) => {
      const match = duration.match(/(\d+)\s*weeks?/)
      return match ? Number.parseInt(match[1], 10) : 1
    }

    const durations = timelineData.map((item) => getDurationInWeeks(item.duration))

    // Calculate cumulative durations for positioning
    const cumulativeDurations: number[] = []
    let cumulative = 0
    durations.forEach((duration) => {
      cumulativeDurations.push(cumulative)
      cumulative += duration
    })

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: timelineData.map((item) => item.name),
        datasets: [
          {
            label: "Duration (weeks)",
            data: durations,
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
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Duration (weeks)",
            },
            stacked: true,
          },
          y: {
            title: {
              display: true,
              text: "Project Phases",
            },
            stacked: true,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              afterLabel: (context) => {
                const index = context.dataIndex
                return [`Deliverables: ${timelineData[index].deliverables}`]
              },
            },
          },
        },
      },
    })
  }

  return (
    <div className="w-full h-[300px]">
      <canvas ref={chartRef} />
    </div>
  )
}
