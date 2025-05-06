import { type NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

// Helper functions for PDF generation
function calculatePercentile(values: number[], percentile: number) {
  if (values.length === 0) return 0
  const sortedValues = [...values].sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sortedValues.length) - 1
  return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))]
}

function calculatePeakHour(hourlyDistribution: Record<string, number>) {
  let peakHour = "0"
  let maxCount = 0

  Object.entries(hourlyDistribution).forEach(([hour, count]) => {
    if (count > maxCount) {
      maxCount = count
      peakHour = hour
    }
  })

  return { hour: peakHour, count: maxCount }
}

function calculateStatusCodeDistribution(logs: any[]) {
  const distribution: Record<string, number> = {}

  logs.forEach((log) => {
    const statusCode = log.status_code || log.status || "200"
    distribution[statusCode] = (distribution[statusCode] || 0) + 1
  })

  return distribution
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { endpoint, logs } = data

    if (!endpoint || !logs || !Array.length) {
      return NextResponse.json({ error: "Invalid data provided" }, { status: 400 })
    }

    // Filter logs for this endpoint
    const endpointLogs = logs.filter((log: any) => log.request_path === endpoint || log.url === endpoint)

    if (endpointLogs.length === 0) {
      return NextResponse.json({ error: "No logs found for this endpoint" }, { status: 404 })
    }

    // Calculate metrics
    const totalRequests = endpointLogs.length
    const uniqueIPs = new Set(endpointLogs.map((log: any) => log.ip || log.public_ip)).size

    // Response times (if available)
    const responseTimes = endpointLogs
      .map((log: any) => log.duration || log.response_time)
      .filter((time: any) => time !== undefined && !isNaN(Number(time)))
      .map((time: any) => Number(time))

    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum: number, time: number) => sum + time, 0) / responseTimes.length
        : 0

    const p95ResponseTime = calculatePercentile(responseTimes, 95)

    // Status code distribution
    const statusCodeDist = calculateStatusCodeDistribution(endpointLogs)
    const successRequests = Object.entries(statusCodeDist)
      .filter(([code]) => code.startsWith("2"))
      .reduce((sum, [_, count]) => sum + count, 0)
    const successRate = (successRequests / totalRequests) * 100

    // Create PDF
    const doc = new jsPDF()

    // Title
    doc.setFontSize(18)
    doc.text(`API Endpoint Analysis: ${endpoint}`, 14, 20)

    // Date
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)

    // Summary
    doc.setFontSize(14)
    doc.text("Executive Summary", 14, 40)

    doc.setFontSize(10)
    doc.text(`This report provides a detailed analysis of the API endpoint ${endpoint}.`, 14, 50)
    doc.text(`Total Requests: ${totalRequests}`, 14, 60)
    doc.text(`Unique Users: ${uniqueIPs}`, 14, 65)
    doc.text(`Success Rate: ${successRate.toFixed(2)}%`, 14, 70)
    doc.text(`Avg Response Time: ${avgResponseTime.toFixed(2)} ms`, 14, 75)
    doc.text(`P95 Response Time: ${p95ResponseTime.toFixed(2)} ms`, 14, 80)

    // Status Code Distribution
    doc.setFontSize(14)
    doc.text("Status Code Distribution", 14, 95)

    const statusRows = Object.entries(statusCodeDist).map(([code, count]) => [
      code,
      count.toString(),
      `${((count / totalRequests) * 100).toFixed(2)}%`,
    ])
    ;(doc as any).autoTable({
      startY: 100,
      head: [["Status Code", "Count", "Percentage"]],
      body: statusRows,
    })

    // Performance Analysis
    const currentY = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(14)
    doc.text("Performance Analysis", 14, currentY)

    let performanceRating = "Excellent"
    if (p95ResponseTime > 1000 || successRate < 95) {
      performanceRating = "Needs Improvement"
    } else if (p95ResponseTime > 500 || successRate < 98) {
      performanceRating = "Good"
    }
    ;(doc as any).autoTable({
      startY: currentY + 5,
      head: [["Metric", "Value", "Rating"]],
      body: [
        [
          "Response Time",
          `${p95ResponseTime.toFixed(2)} ms`,
          p95ResponseTime < 500 ? "Excellent" : p95ResponseTime < 1000 ? "Good" : "Needs Improvement",
        ],
        [
          "Success Rate",
          `${successRate.toFixed(2)}%`,
          successRate > 99 ? "Excellent" : successRate > 95 ? "Good" : "Needs Improvement",
        ],
        ["Overall", "", performanceRating],
      ],
    })

    // Recommendations
    const recY = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(14)
    doc.text("Recommendations", 14, recY)

    const recommendations = []
    if (p95ResponseTime > 1000) {
      recommendations.push("Optimize endpoint performance to reduce response time")
    }
    if (successRate < 95) {
      recommendations.push("Investigate and fix errors causing failed requests")
    }
    if (uniqueIPs < 10) {
      recommendations.push("Consider promoting this API to increase usage")
    }

    let recY2 = recY + 10
    recommendations.forEach((rec) => {
      doc.setFontSize(10)
      doc.text(`• ${rec}`, 14, recY2)
      recY2 += 7
    })

    // Convert to base64
    const pdfBase64 = doc.output("datauristring")

    return NextResponse.json({
      pdfBase64,
      filename: `${endpoint.replace(/\//g, "_")}_analysis.pdf`,
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
