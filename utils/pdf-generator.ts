import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { FeatureReport } from "@/types/report-types"

export async function generatePDF(features: FeatureReport[]) {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Add title
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("Feature Analysis Report", 105, 15, { align: "center" })

  // Add subtitle with system type
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`System: Feature Analysis`, 105, 22, { align: "center" })

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

  const summaryText = `This report provides an analysis of ${features.length} features. The features have been evaluated based on their RICE scores, effort, impact, and risk levels. The report includes recommendations for implementation prioritization.`

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

  // Calculate average RICE score
  const avgRiceScore = features.reduce((sum, feature) => sum + feature.riceScore, 0) / features.length

  // Box 1
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(14, metricsY, boxWidth, boxHeight, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(41, 128, 185)
  doc.text(avgRiceScore.toFixed(1), 14 + boxWidth / 2, metricsY + 8, { align: "center" })
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text("Avg. RICE Score", 14 + boxWidth / 2, metricsY + 15, { align: "center" })

  // Box 2
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(14 + boxWidth + gap, metricsY, boxWidth, boxHeight, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(41, 128, 185)
  doc.text(features.length.toString(), 14 + boxWidth + gap + boxWidth / 2, metricsY + 8, { align: "center" })
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text("Total Features", 14 + boxWidth + gap + boxWidth / 2, metricsY + 15, { align: "center" })

  // Box 3
  const highRiskCount = features.filter((f) => f.risk === "high").length
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(14 + (boxWidth + gap) * 2, metricsY, boxWidth, boxHeight, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(41, 128, 185)
  doc.text(highRiskCount.toString(), 14 + (boxWidth + gap) * 2 + boxWidth / 2, metricsY + 8, { align: "center" })
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text("High Risk Features", 14 + (boxWidth + gap) * 2 + boxWidth / 2, metricsY + 15, { align: "center" })

  // Box 4
  const avgComplexity = features.reduce((sum, feature) => sum + feature.complexity, 0) / features.length
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(14 + (boxWidth + gap) * 3, metricsY, boxWidth, boxHeight, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(41, 128, 185)
  doc.text(avgComplexity.toFixed(1), 14 + (boxWidth + gap) * 3 + boxWidth / 2, metricsY + 8, { align: "center" })
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text("Avg. Complexity", 14 + (boxWidth + gap) * 3 + boxWidth / 2, metricsY + 15, { align: "center" })

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Add features table
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Feature Analysis", 14, 95)

  autoTable(doc, {
    startY: 100,
    head: [["Feature", "RICE Score", "Effort", "Impact", "Risk", "Complexity"]],
    body: features.map((feature) => [
      feature.name,
      feature.riceScore.toFixed(1),
      feature.effort,
      feature.impact,
      feature.risk,
      feature.complexity,
    ]),
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { top: 100 },
  })

  // Add visual representation of feature prioritization
  const featuresY = doc.lastAutoTable?.finalY || 150
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("Feature Prioritization", 14, featuresY + 10)

  // Draw a simple horizontal bar chart for RICE scores
  const barChartY = featuresY + 15
  const barHeight = 8
  const barGap = 4
  const maxBarWidth = 100
  const maxScore = Math.max(...features.map((f) => f.riceScore))

  // Sort features by RICE score
  const sortedFeatures = [...features].sort((a, b) => b.riceScore - a.riceScore)

  sortedFeatures.forEach((feature, index) => {
    const y = barChartY + (barHeight + barGap) * index
    const barWidth = (feature.riceScore / maxScore) * maxBarWidth

    // Draw feature name
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(feature.name, 14, y + barHeight - 2)

    // Draw bar
    doc.setFillColor(41, 128, 185)
    doc.rect(70, y, barWidth, barHeight, "F")

    // Draw score
    doc.setFontSize(8)
    doc.text(feature.riceScore.toFixed(1), 70 + barWidth + 3, y + barHeight - 2)
  })

  // Add recommendations
  const recommendationsY = barChartY + (barHeight + barGap) * sortedFeatures.length + 15
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Recommendations", 14, recommendationsY)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  const recommendationsText = `
1. Prioritize features with high RICE scores and low effort
2. Address high-risk features early in the development cycle
3. Consider breaking down high-complexity features into smaller components
4. Implement features with high business value first to demonstrate ROI
5. Establish clear timelines based on feature complexity and dependencies
  `

  doc.text(recommendationsText, 14, recommendationsY + 6)

  // Add footer
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text("Feature Analyzer Report - Confidential", 105, 285, { align: "center" })

  // Save the PDF
  doc.save("feature-analysis-report.pdf")

  return doc
}
