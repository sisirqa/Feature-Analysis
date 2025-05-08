"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Upload, AlertCircle, ArrowLeft, FileUp, BarChart2 } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import EndpointStatisticsTable from "@/components/endpoint-statistics-table"
import EndpointHourlyDistribution from "@/components/endpoint-hourly-distribution"
import EndpointDailyTrend from "@/components/endpoint-daily-trend"
import EndpointDropFrequency from "@/components/endpoint-drop-frequency"
import EndpointDetailedReport from "@/components/endpoint-detailed-report"
import { generateSampleLogs, type LogEntry } from "@/services/log-analysis-service"
import type { FeatureData } from "@/types/report-types"

export default function EndpointAnalysisPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDetailedReport, setShowDetailedReport] = useState(false)
  const [relatedFeatures, setRelatedFeatures] = useState<FeatureData[]>([])
  const [featureContext, setFeatureContext] = useState<{ id: string; name: string } | null>(null)

  // Get endpoint from URL if provided
  const endpointParam = searchParams.get("endpoint")
  const featureIdParam = searchParams.get("featureId")
  const featureNameParam = searchParams.get("featureName")

  useEffect(() => {
    // Set feature context if provided in URL
    if (featureIdParam && featureNameParam) {
      setFeatureContext({
        id: featureIdParam,
        name: featureNameParam,
      })
    }

    // Set selected endpoint from URL if provided
    if (endpointParam && logs.length > 0) {
      setSelectedEndpoint(endpointParam)
    }

    // If we have a feature context but no logs, generate sample logs
    if (featureIdParam && logs.length === 0) {
      generateSampleData()
    }
  }, [endpointParam, featureIdParam, featureNameParam, logs])

  const generateSampleData = () => {
    // Generate sample logs for Recki API endpoints
    const sampleLogs = generateSampleLogs(30, 500)
    setLogs(sampleLogs)

    // Set a default selected endpoint based on feature name
    if (featureNameParam) {
      // Choose an endpoint based on feature name
      if (featureNameParam.toLowerCase().includes("friend") || featureNameParam.toLowerCase().includes("discover")) {
        setSelectedEndpoint("/recommendations")
      } else if (featureNameParam.toLowerCase().includes("share")) {
        setSelectedEndpoint("/recommendations")
      } else if (featureNameParam.toLowerCase().includes("save")) {
        setSelectedEndpoint("/saved-items")
      } else if (
        featureNameParam.toLowerCase().includes("purchase") ||
        featureNameParam.toLowerCase().includes("buy")
      ) {
        setSelectedEndpoint("/products")
      } else if (featureNameParam.toLowerCase().includes("explore")) {
        setSelectedEndpoint("/products")
      } else {
        setSelectedEndpoint("/recommendations")
      }
    } else {
      setSelectedEndpoint("/recommendations")
    }

    // Generate related features
    const sampleFeatures: FeatureData[] = [
      {
        id: "1",
        name: "Friend Product Discovery",
        description: "Allow users to see product recommendations from their friends",
        reach: 8,
        impact: 9,
        confidence: 8,
        effort: 7,
        riceScore: 8.2,
      },
      {
        id: "2",
        name: "Product Sharing",
        description: "Enable users to share products they like with their network",
        reach: 7,
        impact: 8,
        confidence: 7,
        effort: 6,
        riceScore: 7.5,
      },
    ]

    setRelatedFeatures(sampleFeatures)
  }

  const handleEndpointSelect = (endpoint: string) => {
    setSelectedEndpoint(endpoint)
    setShowDetailedReport(false)

    // Update URL without refreshing the page
    const url = new URL(window.location.href)
    url.searchParams.set("endpoint", endpoint)
    window.history.pushState({}, "", url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file to upload")
      return
    }

    if (!file.name.endsWith(".csv")) {
      setError("File must be a CSV")
      return
    }

    setIsUploading(true)
    setError(null)
    setSelectedEndpoint("")
    setShowDetailedReport(false)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // In a real app, this would be an API call
      // For demo purposes, we'll simulate the response
      setTimeout(() => {
        // Generate sample logs
        generateSampleData()
        setIsUploading(false)
      }, 1500)
    } catch (err) {
      setError(`Upload failed: ${(err as Error).message}`)
      setIsUploading(false)
    }
  }

  const handleShowDetailedReport = () => {
    setShowDetailedReport(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">API Endpoint Analysis</h1>
              <p className="text-muted-foreground mt-2">
                Analyze API endpoint usage patterns to identify high-value enhancement opportunities
              </p>
              {featureContext && (
                <div className="mt-1 text-sm">
                  <span className="text-muted-foreground">Analyzing for feature:</span>
                  <span className="ml-1 font-medium">{featureContext.name}</span>
                  <Link href={`/results?featureId=${featureContext.id}`} className="ml-2 text-primary">
                    Back to Feature Analysis
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload API Logs</CardTitle>
            <CardDescription>
              Upload a CSV file containing API logs to analyze your actual endpoint usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Input type="file" accept=".csv" onChange={handleFileChange} disabled={isUploading} />
                <p className="text-sm text-muted-foreground mt-1">
                  CSV format with columns: id, _id, ip, userAgent, requestBody, requestEndPoint, responseCode, etc.
                </p>
              </div>
              <div className="flex items-end">
                <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full sm:w-auto">
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload and Analyze
                    </>
                  )}
                </Button>
                {!file && !logs.length && (
                  <Button variant="outline" onClick={generateSampleData} className="ml-2">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Generate Sample Data
                  </Button>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {file && !isUploading && !error && logs.length === 0 && (
              <div className="text-sm mt-4">
                Selected file: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
              </div>
            )}

            {logs.length > 0 && (
              <Alert className="mt-4 bg-green-50 border-green-200">
                <AlertDescription>
                  {file ? <>Successfully analyzed data from {file.name}.</> : <>Using sample data for demonstration.</>}{" "}
                  Showing results based on {logs.length} log entries.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {logs.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <FileUp className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-bold">No Data Available</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Please upload a CSV file containing API logs or generate sample data to view endpoint statistics and
                analysis.
              </p>
            </div>
          </Card>
        ) : (
          <>
            <EndpointStatisticsTable logs={logs} daysInSample={30} onEndpointSelect={handleEndpointSelect} />

            {selectedEndpoint && !showDetailedReport && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Endpoint Analysis: {selectedEndpoint}</h2>
                  <Button onClick={handleShowDetailedReport}>Generate Detailed Report</Button>
                </div>

                <Tabs defaultValue="hourly" className="mt-4">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="hourly">Hourly Distribution</TabsTrigger>
                    <TabsTrigger value="daily">Daily Trend</TabsTrigger>
                    <TabsTrigger value="drop">Drop Frequency</TabsTrigger>
                  </TabsList>

                  <TabsContent value="hourly">
                    <EndpointHourlyDistribution logs={logs} endpoint={selectedEndpoint} />
                  </TabsContent>

                  <TabsContent value="daily">
                    <EndpointDailyTrend logs={logs} endpoint={selectedEndpoint} days={30} />
                  </TabsContent>

                  <TabsContent value="drop">
                    <EndpointDropFrequency logs={logs} endpoint={selectedEndpoint} />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {selectedEndpoint && showDetailedReport && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="outline" onClick={() => setShowDetailedReport(false)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Analysis
                  </Button>
                  <h2 className="text-2xl font-bold">Detailed Report: {selectedEndpoint}</h2>
                </div>
                <EndpointDetailedReport
                  logs={logs}
                  endpoint={selectedEndpoint}
                  onBack={() => setShowDetailedReport(false)}
                  features={relatedFeatures}
                />
              </div>
            )}
          </>
        )}
      </main>
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Feature Analyzer. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
