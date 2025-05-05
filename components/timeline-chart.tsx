"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import type { TimelineData } from "@/types/report-types"

Chart.register(...registerables)

interface TimelineChartProps {
  data: TimelineData[]
}

export default function TimelineChart({ data }: TimelineChartProps) {
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

    // Convert duration strings to numbers (weeks)
    const getDurationInWeeks = (duration: string) => {
      const match = duration.match(/(\d+)\s*weeks?/)
      return match ? Number.parseInt(match[1], 10) : 1
    }

    const durations = data.map((item) => getDurationInWeeks(item.duration))

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
        labels: data.map((item) => item.name),
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
                return [`Deliverables: ${data[index].deliverables}`]
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
    <div className="w-full h-[300px]">
      <canvas ref={chartRef} />
    </div>
  )
}
