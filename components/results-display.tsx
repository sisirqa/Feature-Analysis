"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Info, Download, BarChart2, ArrowRight } from "lucide-react"
import Link from "next/link"
import EffortImpactChart from "@/components/effort-impact-chart"
import RiceScoreChart from "@/components/rice-score-chart"
import RiskDistributionChart from "@/components/risk-distribution-chart"
import TimelineChart from "@/components/timeline-chart"
import { generatePDF } from "@/utils/pdf-generator"
import type { FeatureData, RiskData, ComponentData, TimelineData, ChartData } from "@/types/report-types"

export default function ResultsDisplay() {
  const [activeTab, setActiveTab] = useState("summary")

  // Sample data for the report based on the Citypay user stories
  const systemType = "Citypay Payment Platform"
  const clientDescription =
    "Citypay is a digital payment platform that needs to implement several new features to enhance security, compliance, and user experience."

  const features: FeatureData[] = [
    {
      id: "1",
      name: "Browser Change OTP",
      description: "Agent portal - Similar feature as new device OTP for Customer.",
      reach: 8,
      impact: 8,
      confidence: 9,
      effort: 5,
      riceScore: 11.5,
    },
    {
      id: "2",
      name: "Vendor API - MYRA",
      description: "All the task and changes to be done on vendor api",
      reach: 7,
      impact: 9,
      confidence: 7,
      effort: 7,
      riceScore: 6.3,
    },
    {
      id: "3",
      name: "NRB Report Update",
      description: "Update NRB reports according to the provided excel format",
      reach: 6,
      impact: 7,
      confidence: 8,
      effort: 6,
      riceScore: 5.6,
    },
    {
      id: "4",
      name: "Compliance Changes",
      description: "This involves all the changes and features introduced to fulfill NRB compliance for citypay",
      reach: 9,
      impact: 9,
      confidence: 8,
      effort: 8,
      riceScore: 8.1,
    },
    {
      id: "5",
      name: "Password Reset Config",
      description: "Admin should be able to manage the configuration of password reset from the CMS",
      reach: 7,
      impact: 6,
      confidence: 9,
      effort: 4,
      riceScore: 9.5,
    },
    {
      id: "6",
      name: "Dynamic QR - Merchant",
      description: "Merchants should now be able to generate the dynamic QR",
      reach: 8,
      impact: 8,
      confidence: 7,
      effort: 6,
      riceScore: 7.5,
    },
    {
      id: "7",
      name: "Customer Onboarding Consent",
      description: "Implement consent form during customer onboarding process",
      reach: 6,
      impact: 5,
      confidence: 9,
      effort: 3,
      riceScore: 9.0,
    },
  ]

  const chartData: ChartData[] = [
    { name: "Browser Change OTP", effort: 5, impact: 8 },
    { name: "Vendor API - MYRA", effort: 7, impact: 9 },
    { name: "NRB Report Update", effort: 6, impact: 7 },
    { name: "Compliance Changes", effort: 8, impact: 9 },
    { name: "Password Reset Config", effort: 4, impact: 6 },
    { name: "Dynamic QR - Merchant", effort: 6, impact: 8 },
    { name: "Customer Onboarding Consent", effort: 3, impact: 5 },
    { name: "Two-Factor Authentication", effort: 5, impact: 9 },
    { name: "NCHL QR Code Format", effort: 4, impact: 6 },
    { name: "FonePay QR Payment", effort: 7, impact: 8 },
  ]

  const risks: RiskData[] = [
    {
      name: "Security vulnerabilities",
      severity: "High",
      probability: "Medium",
      mitigation: "Implement comprehensive security testing and code review",
    },
    {
      name: "Regulatory compliance",
      severity: "High",
      probability: "Medium",
      mitigation: "Regular audits and updates to meet NRB requirements",
    },
    {
      name: "Integration issues",
      severity: "Medium",
      probability: "High",
      mitigation: "Thorough testing with vendor APIs and third-party services",
    },
    {
      name: "User adoption",
      severity: "Medium",
      probability: "Medium",
      mitigation: "User training and intuitive interface design",
    },
    {
      name: "Performance impact",
      severity: "Low",
      probability: "Medium",
      mitigation: "Performance testing and optimization before deployment",
    },
  ]

  const components: ComponentData[] = [
    { name: "Authentication System", impactLevel: "High", changes: "OTP verification, 2FA, password reset" },
    { name: "API Integration Layer", impactLevel: "High", changes: "MYRA API, FonePay, NCHL integration" },
    { name: "Reporting Module", impactLevel: "Medium", changes: "NRB report formats, compliance reporting" },
    { name: "User Interface", impactLevel: "Medium", changes: "QR code display, consent forms, reset workflows" },
    { name: "Database Schema", impactLevel: "Low", changes: "New tables for compliance and transaction tracking" },
  ]

  const timeline: TimelineData[] = [
    { name: "Security Features", duration: "3 weeks", deliverables: "Browser OTP, 2FA implementation" },
    { name: "API Integrations", duration: "4 weeks", deliverables: "MYRA, FonePay, NCHL integration" },
    { name: "Compliance Updates", duration: "3 weeks", deliverables: "NRB reports, regulatory changes" },
    { name: "User Experience", duration: "2 weeks", deliverables: "Password reset, consent workflows" },
    { name: "QR Payment Features", duration: "3 weeks", deliverables: "Dynamic QR, payment processing" },
    { name: "Testing & Deployment", duration: "2 weeks", deliverables: "QA, security testing, rollout" },
  ]

  // API impact data
  const apiImpactData = [
    {
      feature: "Browser Change OTP",
      endpoints: [
        { endpoint: "/api/auth/otp", impact: "High", currentLoad: "5,200 req/day" },
        { endpoint: "/api/users/verify", impact: "Medium", currentLoad: "3,100 req/day" },
      ],
      overallImpact: "High",
    },
    {
      feature: "Vendor API - MYRA",
      endpoints: [
        { endpoint: "/api/vendors/myra", impact: "High", currentLoad: "1,800 req/day" },
        { endpoint: "/api/transactions", impact: "Medium", currentLoad: "12,500 req/day" },
      ],
      overallImpact: "High",
    },
    {
      feature: "Password Reset Config",
      endpoints: [
        { endpoint: "/api/auth/reset-password", impact: "High", currentLoad: "950 req/day" },
        { endpoint: "/api/admin/settings", impact: "Medium", currentLoad: "320 req/day" },
      ],
      overallImpact: "Medium",
    },
    {
      feature: "Dynamic QR - Merchant",
      endpoints: [
        { endpoint: "/api/qr/generate", impact: "High", currentLoad: "4,100 req/day" },
        { endpoint: "/api/merchants", impact: "Low", currentLoad: "1,200 req/day" },
      ],
      overallImpact: "Medium",
    },
  ]

  const handleExportPDF = () => {
    const doc = generatePDF(systemType, clientDescription, features, risks, components, timeline)
    doc.save("citypay-feature-analysis.pdf")
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Feature Analysis Report</h2>
        <p className="text-muted-foreground mt-2">Analysis of Citypay feature enhancements</p>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={handleExportPDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Analysis Complete</AlertTitle>
        <AlertDescription>
          The feature analysis for Citypay has been completed successfully. Review the results below.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="mb-4">
                Citypay is implementing several key features to enhance security, compliance, and user experience. The
                highest priority features include Browser Change OTP, Compliance Changes, and Password Reset
                Configuration.
              </p>
              <p className="mb-4">
                Security features like Browser Change OTP and Two-Factor Authentication will significantly improve the
                platform's security posture. Compliance changes are critical to meet NRB regulatory requirements.
                Payment features like Dynamic QR and FonePay integration will enhance the user experience and expand
                payment options.
              </p>
              <p>
                Based on our analysis, we recommend implementing these features in phases over approximately 17 weeks,
                starting with the security features followed by compliance updates and payment integrations.
              </p>
            </div>
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2 text-center">Key Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-md p-3 text-center">
                  <div className="text-3xl font-bold text-primary">8.2</div>
                  <div className="text-sm text-muted-foreground">Avg. RICE Score</div>
                </div>
                <div className="border rounded-md p-3 text-center">
                  <div className="text-3xl font-bold text-primary">17</div>
                  <div className="text-sm text-muted-foreground">Weeks Timeline</div>
                </div>
                <div className="border rounded-md p-3 text-center">
                  <div className="text-3xl font-bold text-primary">5</div>
                  <div className="text-sm text-muted-foreground">Major Components</div>
                </div>
                <div className="border rounded-md p-3 text-center">
                  <div className="text-3xl font-bold text-primary">10</div>
                  <div className="text-sm text-muted-foreground">Total Features</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
          <TabsTrigger value="api-impact">API Impact</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Request Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Citypay is a digital payment platform that needs to implement several new features to enhance security,
                compliance, and user experience. The requested features include security enhancements like Browser
                Change OTP and Two-Factor Authentication, compliance updates for NRB regulations, and payment features
                like Dynamic QR codes and FonePay integration.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Feature Overview</h3>
                  <div className="h-[250px]">
                    <RiceScoreChart data={features} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-6">
                    The chart above shows the RICE scores for the requested features. Browser Change OTP has the highest
                    priority with a score of 11.5, followed by Password Reset Config and Compliance Changes.
                  </p>
                </div>
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Implementation Timeline</h3>
                  <div className="h-[250px]">
                    <TimelineChart data={timeline} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-6">
                    The implementation timeline spans 17 weeks, with API Integrations requiring the most time (4 weeks).
                    The project begins with Security Features and concludes with Testing & Deployment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Context</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Citypay is a digital payment platform that currently supports basic payment processing and user
                management. The system needs to enhance its security features, comply with NRB regulations, and expand
                payment options through integrations with services like FonePay and NCHL.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 mb-4">
                <h3 className="font-medium mb-2">Client-Requested Features (RICE scores)</h3>
                <div className="h-[300px] mb-4">
                  <RiceScoreChart data={features} />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  The RICE scoring methodology prioritizes features based on Reach, Impact, Confidence, and Effort. The
                  chart above shows that Browser Change OTP has the highest RICE score (11.5), making it the top
                  priority feature, followed by Password Reset Config (9.5) and Customer Onboarding Consent (9.0).
                </p>
                <table className="w-full mt-4 border-collapse">
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

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Effort vs. Impact Analysis</h3>
                <div className="h-[400px] mb-4">
                  <EffortImpactChart data={chartData} />
                </div>
                <p className="text-sm text-muted-foreground">
                  The Effort vs. Impact chart helps visualize the return on investment for each feature component.
                  Features in the top-left quadrant (Quick Wins) should be prioritized as they offer high impact with
                  low effort. Password Reset Config and Customer Onboarding Consent are in the Quick Wins quadrant.
                  Compliance Changes and Vendor API integration are in the Major Projects quadrant, indicating high
                  impact but also high effort.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 mb-4">
                <h3 className="font-medium mb-2">Identified Risks</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <RiskDistributionChart data={risks} />
                  </div>
                  <div>
                    <p className="mb-4">
                      Our risk analysis identified several key concerns that need to be addressed during implementation:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <span className="font-medium">High Severity Risks:</span> Security vulnerabilities and
                        regulatory compliance require careful attention and mitigation strategies.
                      </li>
                      <li>
                        <span className="font-medium">Medium Severity Risks:</span> Integration issues and user adoption
                        challenges could impact the success of the implementation.
                      </li>
                      <li>
                        <span className="font-medium">Low Severity Risks:</span> Performance impact can be addressed
                        through proper testing and optimization.
                      </li>
                    </ul>
                    <p className="mt-4 text-sm text-muted-foreground">
                      The chart shows the distribution of risks by severity level. High severity risks account for 40%
                      of the identified risks, highlighting the need for robust mitigation strategies.
                    </p>
                  </div>
                </div>
                <table className="w-full border-collapse mt-6">
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
            <CardHeader>
              <CardTitle>Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 mb-4">
                <h3 className="font-medium mb-2">Affected Components</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="mb-4">
                      Implementing the requested features will impact several components of the current system:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <span className="font-medium">Authentication System:</span> Requires significant changes to
                        support OTP verification, 2FA, and password reset functionality.
                      </li>
                      <li>
                        <span className="font-medium">API Integration Layer:</span> New integrations with MYRA, FonePay,
                        and NCHL services.
                      </li>
                      <li>
                        <span className="font-medium">Reporting Module:</span> Updates to support NRB report formats and
                        compliance reporting.
                      </li>
                      <li>
                        <span className="font-medium">User Interface:</span> Changes to support QR code display, consent
                        forms, and reset workflows.
                      </li>
                      <li>
                        <span className="font-medium">Database Schema:</span> New tables for compliance and transaction
                        tracking.
                      </li>
                    </ul>
                  </div>
                  <div className="border rounded-md p-4 bg-muted/30">
                    <h4 className="font-medium mb-2 text-center">Component Impact Distribution</h4>
                    <div className="flex items-center justify-center h-[200px]">
                      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        <div className="border rounded-md p-3 text-center bg-red-100">
                          <div className="text-xl font-bold text-red-600">High</div>
                          <div className="text-sm">Authentication System</div>
                          <div className="text-sm">API Integration Layer</div>
                        </div>
                        <div className="border rounded-md p-3 text-center bg-yellow-100">
                          <div className="text-xl font-bold text-yellow-600">Medium</div>
                          <div className="text-sm">Reporting Module</div>
                          <div className="text-sm">User Interface</div>
                        </div>
                        <div className="border rounded-md p-3 text-center bg-green-100 col-span-2">
                          <div className="text-xl font-bold text-green-600">Low</div>
                          <div className="text-sm">Database Schema</div>
                        </div>
                      </div>
                    </div>
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
              </div>

              <div className="border rounded-md p-4">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    This analysis identifies how the proposed features will impact existing API endpoints and provides
                    recommendations for implementation.
                  </p>
                  <Link href="/endpoint-analysis">
                    <Button className="flex items-center gap-2">
                      <BarChart2 className="h-4 w-4" />
                      <span>View API Analysis</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Feature-to-API Impact Matrix</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Feature</th>
                          <th className="text-left py-2">Affected Endpoints</th>
                          <th className="text-left py-2">Current Load</th>
                          <th className="text-left py-2">Impact Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiImpactData.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 font-medium">{item.feature}</td>
                            <td className="py-2">
                              <div className="space-y-1">
                                {item.endpoints.map((endpoint, i) => (
                                  <div key={i}>{endpoint.endpoint}</div>
                                ))}
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="space-y-1">
                                {item.endpoints.map((endpoint, i) => (
                                  <div key={i}>{endpoint.currentLoad}</div>
                                ))}
                              </div>
                            </td>
                            <td className="py-2">
                              <div className="space-y-1">
                                {item.endpoints.map((endpoint, i) => (
                                  <div key={i}>
                                    <span
                                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                                        endpoint.impact === "High"
                                          ? "bg-red-100 text-red-800"
                                          : endpoint.impact === "Medium"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-green-100 text-green-800"
                                      }`}
                                    >
                                      {endpoint.impact}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>High-Impact API Endpoints</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="inline-block px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            High
                          </span>
                          <div>
                            <div className="font-medium">/api/auth/otp</div>
                            <p className="text-sm text-muted-foreground">
                              Currently handling 5,200 req/day. Browser Change OTP feature will significantly increase
                              load.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="inline-block px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            High
                          </span>
                          <div>
                            <div className="font-medium">/api/vendors/myra</div>
                            <p className="text-sm text-muted-foreground">
                              Currently handling 1,800 req/day. Vendor API integration will require significant changes.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="inline-block px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            High
                          </span>
                          <div>
                            <div className="font-medium">/api/auth/reset-password</div>
                            <p className="text-sm text-muted-foreground">
                              Currently handling 950 req/day. Password Reset Config feature will modify core
                              functionality.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>API Implementation Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0">
                            1
                          </div>
                          <p>
                            Implement rate limiting on high-traffic endpoints to prevent abuse during feature rollout
                          </p>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0">
                            2
                          </div>
                          <p>Add caching strategies for frequently accessed endpoints to improve performance</p>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0">
                            3
                          </div>
                          <p>Consider versioning APIs for backward compatibility during phased rollout</p>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0">
                            4
                          </div>
                          <p>Implement comprehensive monitoring and alerting for affected endpoints</p>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0">
                            5
                          </div>
                          <p>Conduct load testing to ensure endpoints can handle increased traffic</p>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Prioritized Next Steps</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Implement Browser Change OTP for enhanced security (highest RICE score)</li>
                    <li>Develop Password Reset Configuration for both agent and customer portals</li>
                    <li>Implement Customer Onboarding Consent to meet regulatory requirements</li>
                    <li>Update NRB reports according to the provided excel format</li>
                    <li>Implement Two-Factor Authentication for Admin Portal</li>
                    <li>Develop Dynamic QR functionality for merchants</li>
                    <li>Complete remaining compliance changes for NRB requirements</li>
                    <li>Integrate with MYRA vendor API</li>
                    <li>Implement NCHL QR Code format</li>
                    <li>Integrate FonePay QR payment system</li>
                  </ol>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Implementation Timeline</h3>
                  <div className="h-[300px] mb-6">
                    <TimelineChart data={timeline} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    The implementation timeline spans 17 weeks, with API Integrations requiring the most time (4 weeks).
                    The project begins with Security Features and concludes with Testing & Deployment.
                  </p>
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

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Resource Requirements</h3>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Resource</th>
                        <th className="text-left py-2">Allocation</th>
                        <th className="text-left py-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">Backend Developers</td>
                        <td className="py-2">3 FTE</td>
                        <td className="py-2">Focus on API integrations and security features</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Frontend Developers</td>
                        <td className="py-2">2 FTE</td>
                        <td className="py-2">UI updates for QR codes and user workflows</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">QA Engineers</td>
                        <td className="py-2">2 FTE</td>
                        <td className="py-2">Testing security features and integrations</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">DevOps</td>
                        <td className="py-2">1 FTE</td>
                        <td className="py-2">Deployment and monitoring</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Security Specialist</td>
                        <td className="py-2">1 FTE</td>
                        <td className="py-2">Security review and compliance verification</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
