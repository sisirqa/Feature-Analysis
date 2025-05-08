"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BarChart2, Info } from "lucide-react"
import Link from "next/link"
import type { FeatureData } from "@/types/report-types"
import { mapFeatureToEndpoints } from "@/services/feature-api-mapping-service"
import { generateSampleLogs } from "@/services/log-analysis-service"

interface FeatureToApiBridgeProps {
  feature: FeatureData
}

export default function FeatureToApiBridge({ feature }: FeatureToApiBridgeProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [relatedEndpoints, setRelatedEndpoints] = useState<string[]>([])

  useEffect(() => {
    // Generate sample logs and extract endpoints
    const sampleLogs = generateSampleLogs(30, 200)
    const availableEndpoints = Array.from(new Set(sampleLogs.map((log) => log.endpoint)))

    // Map feature to endpoints
    const mappedEndpoints = mapFeatureToEndpoints(feature, availableEndpoints)
    setRelatedEndpoints(mappedEndpoints)
    setIsLoading(false)
  }, [feature])

  const handleViewEndpointAnalysis = (endpoint: string) => {
    router.push(`/endpoint-analysis?endpoint=${encodeURIComponent(endpoint)}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Endpoint Analysis</CardTitle>
        <CardDescription>Analyze API endpoints related to the feature "{feature.name}"</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <p>Analyzing API endpoints...</p>
            </div>
          ) : (
            <>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>API Impact Analysis</AlertTitle>
                <AlertDescription>
                  We've identified {relatedEndpoints.length} API endpoints that may be affected by implementing this
                  feature.
                </AlertDescription>
              </Alert>

              {relatedEndpoints.length > 0 ? (
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3">Endpoint</th>
                        <th className="text-left p-3">Potential Impact</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatedEndpoints.map((endpoint, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 font-medium">{endpoint}</td>
                          <td className="p-3">
                            <Badge
                              className={
                                index % 3 === 0
                                  ? "bg-red-100 text-red-800"
                                  : index % 3 === 1
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }
                            >
                              {index % 3 === 0 ? "High" : index % 3 === 1 ? "Medium" : "Low"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Button variant="outline" size="sm" onClick={() => handleViewEndpointAnalysis(endpoint)}>
                              <BarChart2 className="h-4 w-4 mr-2" />
                              Analyze
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p>No related API endpoints found for this feature.</p>
                </div>
              )}

              <div className="flex justify-end">
                <Link href="/endpoint-analysis">
                  <Button className="flex items-center gap-2">
                    <span>View All API Endpoints</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
