import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { LogEntry } from "@/services/log-analysis-service"

interface EndpointMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  successRate: number
  avgResponseTime: number
  p95ResponseTime: number
  uniqueIPs: number
  peakHour: number
  statusCodes: Record<string, number>
  dailyTrend: { date: string; count: number }[]
  hourlyDistribution: number[]
}

interface Recommendation {
  type: string
  severity: string
  title: string
  description: string
}

interface Enhancement {
  title: string
  description: string
  impact: string
}

export function generateEndpointPDF(
  endpoint: string,
  metrics: EndpointMetrics,
  recommendations: Recommendation[],
  enhancements: Enhancement[],
) {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Add title
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("API Endpoint Analysis Report", 105, 15, { align: "center" })

  // Add subtitle with endpoint
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  const endpointText = endpoint.length > 60 ? endpoint.substring(0, 57) + "..." : endpoint
  doc.text(`Endpoint: ${endpointText}`, 105, 22, { align: "center" })

  // Add date
  const today = new Date().toLocaleDateString()
  doc.setFontSize(10)
  doc.text(`Generated: ${today}`, 105, 28, { align: "center" })

  // Add executive summary
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Executive Summary", 14, 38)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  const summaryText = `This report provides a detailed analysis of the "${endpoint}" API endpoint. 
The endpoint has processed ${metrics.totalRequests.toLocaleString()} requests with a ${metrics.successRate.toFixed(1)}% success rate 
and an average response time of ${metrics.avgResponseTime.toFixed(0)}ms. Peak usage occurs at ${metrics.peakHour}:00.`

  const splitSummary = doc.splitTextToSize(summaryText, 180)
  doc.text(splitSummary, 14, 44)

  // Add key metrics
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Key Metrics", 14, 60)

  // Draw metrics boxes
  const metricsY = 65
  const boxWidth = 40
  const boxHeight = 20
  const gap = 10

  // Box 1 - Total Requests
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(14, metricsY, boxWidth, boxHeight, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(41, 128, 185)
  doc.text(metrics.totalRequests.toLocaleString(), 14 + boxWidth / 2, metricsY + 8, { align: "center" })
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text("Total Requests", 14 + boxWidth / 2, metricsY + 15, { align: "center" })

  // Box 2 - Success Rate
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(14 + boxWidth + gap, metricsY, boxWidth, boxHeight, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(41, 128, 185)
  doc.text(`${metrics.successRate.toFixed(1)}%`, 14 + boxWidth + gap + boxWidth / 2, metricsY + 8, { align: "center" })
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text("Success Rate", 14 + boxWidth + gap + boxWidth / 2, metricsY + 15, { align: "center" })

  // Box 3 - Avg Response Time
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(14 + (boxWidth + gap) * 2, metricsY, boxWidth, boxHeight, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(41, 128, 185)
  doc.text(`${metrics.avgResponseTime.toFixed(0)} ms`, 14 + (boxWidth + gap) * 2 + boxWidth / 2, metricsY + 8, {
    align: "center",
  })
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text("Avg Response Time", 14 + (boxWidth + gap) * 2 + boxWidth / 2, metricsY + 15, { align: "center" })

  // Box 4 - Unique Users
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(14 + (boxWidth + gap) * 3, metricsY, boxWidth, boxHeight, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(41, 128, 185)
  doc.text(metrics.uniqueIPs.toLocaleString(), 14 + (boxWidth + gap) * 3 + boxWidth / 2, metricsY + 8, {
    align: "center",
  })
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text("Unique Users", 14 + (boxWidth + gap) * 3 + boxWidth / 2, metricsY + 15, { align: "center" })

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Add performance analysis
  const performanceY = metricsY + boxHeight + 15
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Performance Analysis", 14, performanceY)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  // Create performance table
  autoTable(doc, {
    startY: performanceY + 5,
    head: [["Metric", "Value", "Rating"]],
    body: [
      [
        "Average Response Time",
        `${metrics.avgResponseTime.toFixed(0)} ms`,
        metrics.avgResponseTime <= 100 ? "Excellent" : metrics.avgResponseTime <= 300 ? "Good" : "Needs Improvement",
      ],
      [
        "95th Percentile Response Time",
        `${metrics.p95ResponseTime.toFixed(0)} ms`,
        metrics.p95ResponseTime <= 200 ? "Excellent" : metrics.p95ResponseTime <= 500 ? "Good" : "Needs Improvement",
      ],
      [
        "Success Rate",
        `${metrics.successRate.toFixed(1)}%`,
        metrics.successRate >= 98 ? "Excellent" : metrics.successRate >= 95 ? "Good" : "Needs Improvement",
      ],
      [
        "Error Rate",
        `${(100 - metrics.successRate).toFixed(1)}%`,
        100 - metrics.successRate <= 2 ? "Excellent" : 100 - metrics.successRate <= 5 ? "Good" : "Needs Improvement",
      ],
      ["Peak Usage Hour", `${metrics.peakHour}:00`, ""],
      ["Unique Users", metrics.uniqueIPs.toLocaleString(), ""],
    ],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
    },
  })

  // Add status code distribution
  const statusCodesY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 150
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Status Code Distribution", 14, statusCodesY)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  // Create status codes table
  const statusCodesData = Object.entries(metrics.statusCodes)
    .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
    .map(([code, count]) => {
      const percentage = (count / metrics.totalRequests) * 100
      let category = ""

      if (Number.parseInt(code) >= 200 && Number.parseInt(code) < 300) {
        category = "Success"
      } else if (Number.parseInt(code) >= 300 && Number.parseInt(code) < 400) {
        category = "Redirect"
      } else if (Number.parseInt(code) >= 400 && Number.parseInt(code) < 500) {
        category = "Client Error"
      } else if (Number.parseInt(code) >= 500) {
        category = "Server Error"
      }

      return [code, count.toLocaleString(), `${percentage.toFixed(1)}%`, category]
    })

  autoTable(doc, {
    startY: statusCodesY + 5,
    head: [["Status Code", "Count", "Percentage", "Category"]],
    body: statusCodesData,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  })

  // Add recommendations
  const recommendationsY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 200
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Recommendations", 14, recommendationsY)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  if (recommendations.length > 0) {
    let currentY = recommendationsY + 10
    recommendations.forEach((recommendation, index) => {
      const title = `${index + 1}. ${recommendation.title} (${recommendation.severity.charAt(0).toUpperCase() + recommendation.severity.slice(1)} Priority)`
      doc.setFont("helvetica", "bold")
      doc.text(title, 14, currentY)
      doc.setFont("helvetica", "normal")

      const descriptionLines = doc.splitTextToSize(recommendation.description, 180)
      doc.text(descriptionLines, 14, currentY + 5)

      currentY += 5 + descriptionLines.length * 5 + 5
    })
  } else {
    doc.text("No critical recommendations. This endpoint is performing well.", 14, recommendationsY + 10)
  }

  // Add enhancement opportunities
  const enhancementsY = doc.getTextDimensions("X").h * 10 + (doc.lastAutoTable?.finalY || 200) + 20

  // Check if we need to add a new page
  if (enhancementsY > 250) {
    doc.addPage()
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Enhancement Opportunities", 14, 20)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)

    if (enhancements.length > 0) {
      let currentY = 30
      enhancements.forEach((enhancement, index) => {
        const title = `${index + 1}. ${enhancement.title} (${enhancement.impact.charAt(0).toUpperCase() + enhancement.impact.slice(1)} Impact)`
        doc.setFont("helvetica", "bold")
        doc.text(title, 14, currentY)
        doc.setFont("helvetica", "normal")

        const descriptionLines = doc.splitTextToSize(enhancement.description, 180)
        doc.text(descriptionLines, 14, currentY + 5)

        currentY += 5 + descriptionLines.length * 5 + 5
      })
    } else {
      doc.text("No specific enhancement opportunities identified for this endpoint.", 14, 30)
    }
  } else {
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Enhancement Opportunities", 14, enhancementsY)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)

    if (enhancements.length > 0) {
      let currentY = enhancementsY + 10
      enhancements.forEach((enhancement, index) => {
        const title = `${index + 1}. ${enhancement.title} (${enhancement.impact.charAt(0).toUpperCase() + enhancement.impact.slice(1)} Impact)`
        doc.setFont("helvetica", "bold")
        doc.text(title, 14, currentY)
        doc.setFont("helvetica", "normal")

        const descriptionLines = doc.splitTextToSize(enhancement.description, 180)
        doc.text(descriptionLines, 14, currentY + 5)

        currentY += 5 + descriptionLines.length * 5 + 5
      })
    } else {
      doc.text("No specific enhancement opportunities identified for this endpoint.", 14, enhancementsY + 10)
    }
  }

  // Add footer
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text("API Endpoint Analysis Report - Confidential", 105, 285, { align: "center" })

  return doc
}

// Helper functions
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[index]
}

export function calculatePeakHour(logs: LogEntry[]): number {
  const hourCounts = new Array(24).fill(0)
  logs.forEach((log) => {
    const hour = new Date(log.timestamp).getHours()
    hourCounts[hour]++
  })
  return hourCounts.indexOf(Math.max(...hourCounts))
}

export function calculateStatusCodeDistribution(logs: LogEntry[]): Record<string, number> {
  const statusCodes: Record<string, number> = {}
  logs.forEach((log) => {
    const code = log.statusCode.toString()
    statusCodes[code] = (statusCodes[code] || 0) + 1
  })
  return statusCodes
}

export function calculateDailyTrend(logs: LogEntry[]): { date: string; count: number }[] {
  const dailyCounts = new Map<string, number>()
  logs.forEach((log) => {
    const date = new Date(log.timestamp).toISOString().split("T")[0]
    dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1)
  })
  return Array.from(dailyCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function calculateHourlyDistribution(logs: LogEntry[]): number[] {
  const hourCounts = new Array(24).fill(0)
  logs.forEach((log) => {
    const hour = new Date(log.timestamp).getHours()
    hourCounts[hour]++
  })
  return hourCounts
}
