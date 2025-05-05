import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { FeatureData, RiskData, ComponentData, TimelineData } from "@/types/report-types"

export function generatePDF(
  systemType: string,
  clientDescription: string,
  features: FeatureData[],
  risks: RiskData[],
  components: ComponentData[],
  timeline: TimelineData[],
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
  doc.text("Feature Analysis Report", 105, 15, { align: "center" })

  // Add subtitle with system type
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`System: ${systemType}`, 105, 22, { align: "center" })

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

  const summaryText =
    "The client has requested international transfer capabilities for their Digital Wallet system. This enhancement would require significant changes to the transaction processing system, database schema, and API endpoints. The feature has high business value but introduces moderate technical complexity and security considerations."

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

  // Box 1
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(14, metricsY, boxWidth, boxHeight, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(41, 128, 185)
  doc.text("8.9", 14 + boxWidth / 2, metricsY + 8, { align: "center" })
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
  doc.text("11", 14 + boxWidth + gap + boxWidth / 2, metricsY + 8, { align: "center" })
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text("Weeks Timeline", 14 + boxWidth + gap + boxWidth / 2, metricsY + 15, { align: "center" })

  // Box 3
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(14 + (boxWidth + gap) * 2, metricsY, boxWidth, boxHeight, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(41, 128, 185)
  doc.text("4", 14 + (boxWidth + gap) * 2 + boxWidth / 2, metricsY + 8, { align: "center" })
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text("Major Components", 14 + (boxWidth + gap) * 2 + boxWidth / 2, metricsY + 15, { align: "center" })

  // Box 4
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(14 + (boxWidth + gap) * 3, metricsY, boxWidth, boxHeight, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(41, 128, 185)
  doc.text("3", 14 + (boxWidth + gap) * 3 + boxWidth / 2, metricsY + 8, { align: "center" })
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text("High Priority Features", 14 + (boxWidth + gap) * 3 + boxWidth / 2, metricsY + 15, { align: "center" })

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Add client description
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Client Request", 14, 95)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  const descriptionText =
    clientDescription ||
    "The client has requested adding international transfers with support for multiple currencies and real-time exchange rates to their Digital Wallet platform."

  const splitDescription = doc.splitTextToSize(descriptionText, 180)
  doc.text(splitDescription, 14, 101)

  // Add features table
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Feature Analysis", 14, 115)

  autoTable(doc, {
    startY: 120,
    head: [["Feature", "Reach", "Impact", "Confidence", "Effort", "RICE Score"]],
    body: features.map((feature) => [
      feature.name,
      feature.reach,
      feature.impact,
      feature.confidence,
      feature.effort,
      feature.riceScore,
    ]),
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { top: 120 },
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
    doc.text(feature.riceScore.toString(), 70 + barWidth + 3, y + barHeight - 2)
  })

  // Add risks table
  const risksY = barChartY + (barHeight + barGap) * sortedFeatures.length + 15
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Risk Analysis", 14, risksY)

  autoTable(doc, {
    startY: risksY + 5,
    head: [["Risk", "Severity", "Probability", "Mitigation"]],
    body: risks.map((risk) => [risk.name, risk.severity, risk.probability, risk.mitigation]),
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  })

  // Add impact table
  const impactY = doc.lastAutoTable?.finalY || 220
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Impact Analysis", 14, impactY + 10)

  autoTable(doc, {
    startY: impactY + 15,
    head: [["Component", "Impact Level", "Changes Required"]],
    body: components.map((component) => [component.name, component.impactLevel, component.changes]),
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  })

  // Add timeline table
  const timelineY = doc.lastAutoTable?.finalY || 260
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Implementation Timeline", 14, timelineY + 10)

  autoTable(doc, {
    startY: timelineY + 15,
    head: [["Phase", "Duration", "Key Deliverables"]],
    body: timeline.map((phase) => [phase.name, phase.duration, phase.deliverables]),
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  })

  // Add recommendations
  const recommendationsY = doc.lastAutoTable?.finalY || 280
  if (recommendationsY < 250) {
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Recommendations", 14, recommendationsY + 10)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)

    const recommendationsText =
      "1. Implement database schema changes to support multiple currencies\n2. Integrate with a reliable exchange rate API for real-time rates\n3. Develop the backend API endpoints for international transfers\n4. Enhance security measures for international transactions"

    doc.text(recommendationsText, 14, recommendationsY + 16)
  }

  // Add footer
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text("Feature Analyzer Report - Confidential", 105, 285, { align: "center" })

  return doc
}
