"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface FeatureApiConnectionsProps {
  featureName?: string
  featureDescription?: string
}

// Sample endpoint data to prevent re-creation on each render
const sampleEndpoints = [
  {
    path: "/api/auth/login",
    method: "POST",
    impact: "high",
    currentLoad: "245 req/min",
    estimatedAdditionalLoad: "120 req/min",
    riskLevel: "medium",
    recommendation: "Implement rate limiting and caching",
  },
  {
    path: "/api/users/profile",
    method: "GET",
    impact: "medium",
    currentLoad: "180 req/min",
    estimatedAdditionalLoad: "90 req/min",
    riskLevel: "low",
    recommendation: "No changes needed, endpoint can handle additional load",
  },
  {
    path: "/api/auth/register",
    method: "POST",
    impact: "high",
    currentLoad: "50 req/min",
    estimatedAdditionalLoad: "100 req/min",
    riskLevel: "high",
    recommendation: "Consider implementing queue system for registration",
  },
]

export default function FeatureApiConnections({
  featureName = "User Authentication",
  featureDescription = "Implement secure login and registration functionality with JWT tokens",
}: FeatureApiConnectionsProps) {
  const [impactedEndpoints, setImpactedEndpoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) return

    // Simulate API call to get impacted endpoints
    const analyzeFeatureApiImpact = () => {
      setLoading(true)

      // This would be a real API call in production
      const timer = setTimeout(() => {
        setImpactedEndpoints(sampleEndpoints)
        setLoading(false)
      }, 1500)

      return () => clearTimeout(timer)
    }

    analyzeFeatureApiImpact()
    hasInitialized.current = true
  }, []) // Empty dependency array to run only once

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return <Badge className="bg-red-500">{impact}</Badge>
      case "medium":
        return <Badge className="bg-yellow-500">{impact}</Badge>
      case "low":
        return <Badge className="bg-green-500">{impact}</Badge>
      default:
        return <Badge>{impact}</Badge>
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "high":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "low":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return null
    }
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">API Impact Analysis for Feature: {featureName}</CardTitle>
        <CardDescription className="text-gray-500">{featureDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Impacted API Endpoints ({impactedEndpoints.length})</h3>
              <div className="space-y-4">
                {impactedEndpoints.map((endpoint, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded mr-2">{endpoint.method}</span>
                        <span className="font-mono text-sm">{endpoint.path}</span>
                      </div>
                      <div>{getImpactBadge(endpoint.impact)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-gray-500">Current Load</p>
                        <p className="font-medium">{endpoint.currentLoad}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estimated Additional</p>
                        <p className="font-medium">{endpoint.estimatedAdditionalLoad}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center">
                      <div className="mr-2">{getRiskIcon(endpoint.riskLevel)}</div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Recommendation:</span> {endpoint.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Link href="/endpoint-analysis">
                <Button className="flex items-center">
                  View Detailed API Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
