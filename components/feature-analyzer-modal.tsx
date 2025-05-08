"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import RiceScoreChart from "@/components/rice-score-chart"
import EffortImpactChart from "@/components/effort-impact-chart"
import RiskDistributionChart from "@/components/risk-distribution-chart"
import FeatureApiImpactAnalysis from "@/components/feature-api-impact"
import { generatePDF } from "@/utils/pdf-generator"
import type { FeatureData, RiskData, ComponentData, TimelineData, ChartData } from "@/types/report-types"

interface FeatureAnalyzerModalProps {
  featureId: string
  featureName: string
  featureDetails: string
  onClose: () => void
}

export default function FeatureAnalyzerModal({
  featureId,
  featureName,
  featureDetails,
  onClose,
}: FeatureAnalyzerModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [activeTab, setActiveTab] = useState("summary")

  // Sample data for the report - in a real implementation, this would be generated from the analysis
  const features: FeatureData[] = [
    {
      id: featureId,
      name: featureName,
      description: featureDetails,
      reach: 8,
      impact: 9,
      confidence: 8,
      effort: 7,
      riceScore: 8.2,
    },
    {
      id: "sub1",
      name: "Sub-feature 1",
      description: "A component of the main feature",
      reach: 8,
      impact: 7,
      confidence: 9,
      effort: 5,
      riceScore: 10.1,
    },
    {
      id: "sub2",
      name: "Sub-feature 2",
      description: "Another component of the main feature",
      reach: 7,
      impact: 6,
      confidence: 8,
      effort: 4,
      riceScore: 8.4,
    },
  ]

  const chartData: ChartData[] = [
    { name: featureName, effort: 7, impact: 9 },
    { name: "Sub-feature 1", effort: 5, impact: 7 },
    { name: "Sub-feature 2", effort: 4, impact: 6 },
  ]

  const risks: RiskData[] = [
    {
      name: "Implementation risk",
      severity: "Medium",
      probability: "High",
      mitigation: "Detailed planning and testing",
    },
    { name: "User adoption", severity: "High", probability: "Medium", mitigation: "User training and documentation" },
    {
      name: "Performance impact",
      severity: "High",
      probability: "Low",
      mitigation: "Performance testing before deployment",
    },
  ]

  const components: ComponentData[] = [
    { name: "Frontend", impactLevel: "High", changes: "UI changes required" },
    { name: "Backend API", impactLevel: "Medium", changes: "New endpoints needed" },
    { name: "Database", impactLevel: "Medium", changes: "Schema updates required" },
    { name: "Security", impactLevel: "High", changes: "Authentication flow changes" },
  ]

  const timeline: TimelineData[] = [
    { name: "Planning & Design", duration: "1 week", deliverables: "Technical specifications, API design" },
    { name: "Development", duration: "2 weeks", deliverables: "Implementation of core functionality" },
    { name: "Testing", duration: "1 week", deliverables: "QA and bug fixes" },
    { name: "Deployment", duration: "1 week", deliverables: "Production release and monitoring" },
  ]

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false)
      setIsAnalyzed(true)
    }, 2000)
  }

  const handleExportPDF = () => {
    const doc = generatePDF("Citypay", featureDetails, features, risks, components, timeline)
    doc.save(`feature-analysis-${featureId}.pdf`)
  }

  return (
    <div className="space-y-4">
      {!isAnalyzed ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Feature Details</h3>
                  <p className="text-sm text-muted-foreground mt-1">{featureDetails}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Analysis Options</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    The analyzer will extract information from user stories, acceptance criteria, and API documentation
                    to generate a comprehensive analysis report.
                  </p>
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Start Analysis"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Analysis Results</h2>
            <Button onClick={handleExportPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>

          <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
              <TabsTrigger value="impact">Impact</TabsTrigger>
              <TabsTrigger value="api">API Impact</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Executive Summary</h3>
                      <p className="text-sm">
                        This feature requires moderate effort with high business impact. The implementation will affect
                        multiple components including frontend, backend, and database. Key risks have been identified
                        and mitigation strategies proposed.
                      </p>
                      <p className="text-sm mt-2">
                        Based on the RICE score analysis, this feature and its sub-features have high priority and
                        should be implemented according to the proposed timeline.
                      </p>
                      <p className="text-sm mt-2">
                        API impact analysis shows that several endpoints will be affected by this implementation, with
                        varying degrees of impact. Proper testing and monitoring will be essential during deployment.
                      </p>
                    </div>
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2 text-center">Key Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-md p-3 text-center">
                          <div className="text-3xl font-bold text-primary">8.9</div>
                          <div className="text-sm text-muted-foreground">Avg. RICE Score</div>
                        </div>
                        <div className="border rounded-md p-3 text-center">
                          <div className="text-3xl font-bold text-primary">5</div>
                          <div className="text-sm text-muted-foreground">Weeks Timeline</div>
                        </div>
                        <div className="border rounded-md p-3 text-center">
                          <div className="text-3xl font-bold text-primary">4</div>
                          <div className="text-sm text-muted-foreground">Major Components</div>
                        </div>
                        <div className="border rounded-md p-3 text-center">
                          <div className="text-3xl font-bold text-primary">3</div>
                          <div className="text-sm text-muted-foreground">Identified Risks</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Feature Breakdown</h3>
                      <p className="text-sm text-muted-foreground">
                        The feature has been broken down into sub-features for analysis. Each sub-feature has been
                        scored using the RICE methodology.
                      </p>
                    </div>

                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">RICE Score Analysis</h3>
                      <div className="h-[300px]">
                        <RiceScoreChart data={features} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        The chart shows RICE scores for the feature and its sub-features. Higher scores indicate higher
                        priority.
                      </p>
                    </div>

                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Effort vs. Impact Analysis</h3>
                      <div className="h-[400px]">
                        <EffortImpactChart data={chartData} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        This chart helps visualize the return on investment for each feature component. Items in the
                        top-left quadrant (Quick Wins) should be prioritized.
                      </p>
                    </div>

                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Feature</th>
                          <th className="text-left py-2">Reach</th>
                          <th className="text-left py-2">Impact</th>
                          <th className="text-left py-2">Confidence</th>
                          <th className="text-left py-2">Effort</th>
                          <th className="text-left py-2">RICE Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {features.map((feature, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{feature.name}</td>
                            <td className="py-2">{feature.reach}</td>
                            <td className="py-2">{feature.impact}</td>
                            <td className="py-2">{feature.confidence}</td>
                            <td className="py-2">{feature.effort}</td>
                            <td className="py-2">{feature.riceScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Risk Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Key risks have been identified and assessed based on severity and probability. Mitigation
                        strategies are proposed for each risk.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2">Risk Distribution</h3>
                        <div className="h-[300px]">
                          <RiskDistributionChart data={risks} />
                        </div>
                      </div>
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2">Key Risks</h3>
                        <ul className="space-y-2">
                          {risks.map((risk, index) => (
                            <li key={index} className="border-b pb-2">
                              <div className="font-medium">{risk.name}</div>
                              <div className="text-sm">
                                <span
                                  className={`inline-block px-2 py-1 rounded-full text-xs mr-2 ${
                                    risk.severity === "High"
                                      ? "bg-red-100 text-red-800"
                                      : risk.severity === "Medium"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {risk.severity}
                                </span>
                                <span className="text-muted-foreground">Probability: {risk.probability}</span>
                              </div>
                              <div className="text-sm mt-1">Mitigation: {risk.mitigation}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Risk</th>
                          <th className="text-left py-2">Severity</th>
                          <th className="text-left py-2">Probability</th>
                          <th className="text-left py-2">Mitigation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {risks.map((risk, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{risk.name}</td>
                            <td className="py-2">{risk.severity}</td>
                            <td className="py-2">{risk.probability}</td>
                            <td className="py-2">{risk.mitigation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="impact" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Impact Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        This analysis identifies the components affected by the feature implementation and the level of
                        impact on each component.
                      </p>
                    </div>

                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Affected Components</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {components.map((component, index) => (
                          <div
                            key={index}
                            className={`border rounded-md p-3 ${
                              component.impactLevel === "High"
                                ? "bg-red-50"
                                : component.impactLevel === "Medium"
                                  ? "bg-yellow-50"
                                  : "bg-green-50"
                            }`}
                          >
                            <div className="font-medium">{component.name}</div>
                            <div className="text-xs mt-1">{component.impactLevel} Impact</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Component</th>
                          <th className="text-left py-2">Impact Level</th>
                          <th className="text-left py-2">Changes Required</th>
                        </tr>
                      </thead>
                      <tbody>
                        {components.map((component, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{component.name}</td>
                            <td className="py-2">{component.impactLevel}</td>
                            <td className="py-2">{component.changes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div>
                      <h3 className="font-medium mb-2">Implementation Timeline</h3>
                      <div className="border rounded-md p-4">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Phase</th>
                              <th className="text-left py-2">Duration</th>
                              <th className="text-left py-2">Key Deliverables</th>
                            </tr>
                          </thead>
                          <tbody>
                            {timeline.map((phase, index) => (
                              <tr key={index} className="border-b">
                                <td className="py-2">{phase.name}</td>
                                <td className="py-2">{phase.duration}</td>
                                <td className="py-2">{phase.deliverables}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <FeatureApiImpactAnalysis feature={features[0]} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
