"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import type { FeatureReport } from "@/types/report-types"
import EffortImpactChart from "@/components/effort-impact-chart"
import RiceScoreChart from "@/components/rice-score-chart"
import RiskDistributionChart from "@/components/risk-distribution-chart"
import TimelineChart from "@/components/timeline-chart"
import AppOverview from "@/components/app-overview"
import FeatureApiConnections from "@/components/feature-api-connections"
import FeatureAdvisorChat from "@/components/feature-advisor-chat"
import { Button } from "@/components/ui/button"
import { Download, FileText, MessageSquare } from "lucide-react"
import { generatePDF } from "@/utils/pdf-generator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define sample timeline data outside the component to prevent re-creation on each render
const sampleTimelineData = [
  { name: "Planning & Design", duration: "2 weeks", deliverables: "Technical specifications, API design" },
  { name: "Development", duration: "3 weeks", deliverables: "Implementation of core functionality" },
  { name: "Testing", duration: "2 weeks", deliverables: "QA and bug fixes" },
  { name: "Deployment", duration: "1 week", deliverables: "Production release and monitoring" },
]

// Sample features data for Recki
const sampleFeatures: FeatureReport[] = [
  {
    id: "1",
    name: "Friend Product Discovery",
    description: "Allow users to see product recommendations from their friends",
    effort: 7,
    impact: 9,
    confidence: 8,
    riceScore: 72,
    complexity: 6,
    businessValue: 9,
    risk: "medium",
    timeline: 14,
    dependencies: ["User Authentication", "Product Database"],
    userStories: ["As a user, I want to see product recommendations from my friends so I can discover trusted items."],
  },
  {
    id: "2",
    name: "Product Sharing",
    description: "Enable users to share products they like with their network",
    effort: 5,
    impact: 8,
    confidence: 9,
    riceScore: 86,
    complexity: 5,
    businessValue: 8,
    risk: "low",
    timeline: 10,
    dependencies: ["Product Database"],
    userStories: ["As a user, I want to share a product I like so others can benefit from my recommendation."],
  },
  {
    id: "3",
    name: "Save Products Feature",
    description: "Allow users to save products to a wishlist for later purchase",
    effort: 4,
    impact: 7,
    confidence: 9,
    riceScore: 94,
    complexity: 4,
    businessValue: 7,
    risk: "low",
    timeline: 7,
    dependencies: ["Product Database", "User Authentication"],
    userStories: ["As a user, I want to save products to a list so I can buy them later."],
  },
  {
    id: "4",
    name: "Direct Purchase Integration",
    description: "Enable users to buy products directly through the platform",
    effort: 9,
    impact: 10,
    confidence: 7,
    riceScore: 54,
    complexity: 8,
    businessValue: 10,
    risk: "high",
    timeline: 21,
    dependencies: ["Product Database", "User Authentication", "Payment Processing"],
    userStories: ["As a user, I want to buy a product directly from Recki so I don't have to search for it elsewhere."],
  },
  {
    id: "5",
    name: "Explore & Discovery",
    description: "Provide a discovery section for users to find popular and trending products",
    effort: 6,
    impact: 8,
    confidence: 8,
    riceScore: 75,
    complexity: 6,
    businessValue: 8,
    risk: "medium",
    timeline: 12,
    dependencies: ["Product Database", "Recommendation Engine"],
    userStories: ["As a user, I want to explore popular or trending products to find new ideas."],
  },
]

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [features, setFeatures] = useState<FeatureReport[]>([])
  const [selectedFeature, setSelectedFeature] = useState<FeatureReport | null>(null)
  const [loading, setLoading] = useState(true)
  const isInitializedRef = useRef(false)

  // Use useMemo to prevent re-creation of timelineData on each render
  const timelineData = useMemo(() => sampleTimelineData, [])

  // Memoize the feature selection handler to prevent recreation on each render
  const handleFeatureSelect = useCallback((feature: FeatureReport) => {
    setSelectedFeature(feature)
  }, [])

  useEffect(() => {
    // This effect should only run once when the component mounts
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    let isMounted = true

    const loadFeatures = () => {
      try {
        const featuresParam = searchParams.get("features")
        if (featuresParam) {
          const parsedFeatures = JSON.parse(decodeURIComponent(featuresParam)) as FeatureReport[]
          if (isMounted) {
            setFeatures(parsedFeatures)
            if (parsedFeatures.length > 0) {
              setSelectedFeature(parsedFeatures[0])
            }
          }
        } else {
          // Use sample data if no features are provided
          if (isMounted) {
            setFeatures(sampleFeatures)
            setSelectedFeature(sampleFeatures[0])
          }
        }
      } catch (error) {
        console.error("Error parsing features:", error)
        // Set default sample data on error
        if (isMounted) {
          setFeatures(sampleFeatures)
          setSelectedFeature(sampleFeatures[0])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadFeatures()

    // Cleanup function to prevent state updates if the component unmounts
    return () => {
      isMounted = false
    }
  }, [searchParams]) // Only re-run if searchParams changes

  const handleDownloadPDF = async () => {
    if (features.length > 0) {
      await generatePDF(features)
    }
  }

  // Memoize the suggested questions to prevent recreation on each render
  const suggestedQuestions = useMemo(
    () => [
      "Which feature should we implement first?",
      "What if we combine the Product Sharing and Save Products features?",
      "How can we reduce the risk of the Direct Purchase Integration?",
      "Should we create a feature for user reviews and ratings?",
      "What are the potential bottlenecks in our implementation plan?",
    ],
    [],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Feature Analysis Report</h1>
        <div className="flex gap-4">
          <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
            <Download size={16} />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Analysis Results
          </TabsTrigger>
          <TabsTrigger value="advisor" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Feature Advisor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <AppOverview features={features} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <EffortImpactChart features={features} />
                <RiceScoreChart features={features} />
                <RiskDistributionChart features={features} />
                <TimelineChart data={timelineData} features={features} />
              </div>

              {selectedFeature && (
                <FeatureApiConnections
                  featureName={selectedFeature.name}
                  featureDescription={selectedFeature.description}
                />
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Feature Details</h2>
                <div className="space-y-4">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedFeature?.id === feature.id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => handleFeatureSelect(feature)}
                    >
                      <h3 className="font-medium">{feature.name}</h3>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">RICE Score:</span> {feature.riceScore}
                        </div>
                        <div>
                          <span className="text-gray-500">Risk:</span> {feature.risk}
                        </div>
                        <div>
                          <span className="text-gray-500">Timeline:</span> {feature.timeline} days
                        </div>
                        <div>
                          <span className="text-gray-500">Complexity:</span> {feature.complexity}/10
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advisor">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FeatureAdvisorChat features={features} />
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Feature Details</h2>
                <div className="space-y-4">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedFeature?.id === feature.id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => handleFeatureSelect(feature)}
                    >
                      <h3 className="font-medium">{feature.name}</h3>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">RICE Score:</span> {feature.riceScore}
                        </div>
                        <div>
                          <span className="text-gray-500">Risk:</span> {feature.risk}
                        </div>
                        <div>
                          <span className="text-gray-500">Timeline:</span> {feature.timeline} days
                        </div>
                        <div>
                          <span className="text-gray-500">Complexity:</span> {feature.complexity}/10
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Suggested Questions</h2>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Try asking the AI advisor questions like:</p>
                  <ul className="space-y-2 text-sm">
                    {suggestedQuestions.map((question, index) => (
                      <li key={index} className="p-2 bg-muted rounded-md hover:bg-muted/80 cursor-pointer">
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
