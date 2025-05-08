"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, AlertTriangle } from "lucide-react"
import Link from "next/link"
import type { FeatureReport } from "@/types/report-types"
import { analyzeFeatureApiImpact } from "@/services/feature-api-impact-service"

interface FeatureToEndpointBridgeProps {
  feature: FeatureReport
}

export default function FeatureToEndpointBridge({ feature }: FeatureToEndpointBridgeProps) {
  const [apiImpact, setApiImpact] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const hasInitialized = useRef(false)
  const featureIdRef = useRef(feature?.id)

  useEffect(() => {
    // Only run if the feature ID changes or on first render
    if (hasInitialized.current && featureIdRef.current === feature?.id) return

    featureIdRef.current = feature?.id

    const getApiImpact = async () => {
      try {
        setLoading(true)
        const impact = await analyzeFeatureApiImpact(feature)
        setApiImpact(impact)
      } catch (error) {
        console.error("Error analyzing API impact:", error)
      } finally {
        setLoading(false)
      }
    }

    getApiImpact()
    hasInitialized.current = true
  }, [feature]) // Only re-run if feature changes

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">API Endpoint Impact</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : apiImpact ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                <span className="font-medium">Impacted Endpoints:</span>
                <span className="ml-2">{apiImpact.impactedEndpoints.length}</span>
              </div>
              <div className="flex items-center">
                <AlertTriangle className={`h-5 w-5 mr-2 ${getRiskColor(apiImpact.overallRisk)}`} />
                <span className="font-medium">Overall Risk:</span>
                <span className={`ml-2 capitalize ${getRiskColor(apiImpact.overallRisk)}`}>
                  {apiImpact.overallRisk}
                </span>
              </div>
            </div>

            <div className="text-sm">
              <p className="font-medium mb-1">Top Recommendations:</p>
              <ul className="list-disc pl-5 space-y-1">
                {apiImpact.recommendations.slice(0, 2).map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>

            <Link
              href={{
                pathname: "/endpoint-analysis",
                query: { featureId: feature.id, featureName: feature.name },
              }}
            >
              <Button className="w-full mt-2 flex items-center justify-center">
                View Full API Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No API impact data available</div>
        )}
      </CardContent>
    </Card>
  )
}
