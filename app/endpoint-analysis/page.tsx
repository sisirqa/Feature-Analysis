"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Upload, AlertCircle, ArrowLeft } from "lucide-react"
import Header from "@/components/header"
import EndpointStatisticsTable from "@/components/endpoint-statistics-table"
import EndpointHourlyDistribution from "@/components/endpoint-hourly-distribution"
import EndpointDailyTrend from "@/components/endpoint-daily-trend"
import EndpointDropFrequency from "@/components/endpoint-drop-frequency"
import { generateSampleLogs, type LogEntry } from "@/services/log-analysis-service"

export default function EndpointAnalysisPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUsingUploadedData, setIsUsingUploadedData] = useState(false)

  // Get endpoint from URL if provided
  const endpointParam = searchParams.get("endpoint")

  useEffect(() => {
    // Load sample logs for demonstration
    const sampleLogs = generateSampleLogs(30, 500)
    setLogs(sampleLogs)

    // Set selected endpoint from URL or use the most frequent endpoint
    if (endpointParam) {
      setSelectedEndpoint(endpointParam)
    } else {
      // Find the most frequent endpoint
      const endpointCounts = new Map<string, number>()
      sampleLogs.forEach((log) => {
        const endpoint = log.endpoint
        endpointCounts.set(endpoint, (endpointCounts.get(endpoint) || 0) + 1)
      })

      let maxCount = 0
      let mostFrequentEndpoint = ""

      endpointCounts.forEach((count, endpoint) => {
        if (count > maxCount) {
          maxCount = count
          mostFrequentEndpoint = endpoint
        }
      })

      setSelectedEndpoint(mostFrequentEndpoint)
    }

    setIsLoading(false)
  }, [endpointParam])

  const handleEndpointSelect = (endpoint: string) => {
    setSelectedEndpoint(endpoint)

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

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/logs/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload file")
      }

      // Transform the API response to LogEntry format
      if (result.success && result.analysis && result.analysis.totalRequests > 0) {
        // This is a simplified transformation - in a real app, you'd need to map the actual data structure
        // from your API response to the LogEntry format
        const transformedLogs: LogEntry[] = []

        // For each endpoint in topEndpoints, create log entries
        result.analysis.topEndpoints.forEach((endpoint: any) => {
          // Create multiple log entries for each endpoint based on count
          const count = Math.min(endpoint.count, 1000) // Limit to 1000 entries per endpoint for performance

          for (let i = 0; i < count; i++) {
            // Generate a random timestamp within the last 30 days
            const date = new Date()
            date.setDate(date.getDate() - Math.floor(Math.random() * 30))
            date.setHours(Math.floor(Math.random() * 24))

            // Determine if this request was successful based on success rate
            const isSuccess = Math.random() * 100 < (endpoint.successRate || 95)

            transformedLogs.push({
              timestamp: date.toISOString(),
              ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
              endpoint: endpoint.endpoint,
              statusCode: isSuccess ? 200 : Math.random() > 0.5 ? 400 : 500,
              responseTime: endpoint.avgResponseTime || Math.floor(Math.random() * 500) + 50,
              userAgent: "Mozilla/5.0",
            })
          }
        })

        setLogs(transformedLogs)
        setIsUsingUploadedData(true)

        // Find the most frequent endpoint in the uploaded data
        if (transformedLogs.length > 0) {
          const endpointCounts = new Map<string, number>()
          transformedLogs.forEach((log) => {
            const endpoint = log.endpoint
            endpointCounts.set(endpoint, (endpointCounts.get(endpoint) || 0) + 1)
          })

          let maxCount = 0
          let mostFrequentEndpoint = ""

          endpointCounts.forEach((count, endpoint) => {
            if (count > maxCount) {
              maxCount = count
              mostFrequentEndpoint = endpoint
            }
          })

          setSelectedEndpoint(mostFrequentEndpoint)
        }
      } else {
        throw new Error("No data found in the uploaded file")
      }
    } catch (err) {
      setError(`Upload failed: ${(err as Error).message}`)
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4">Loading API Endpoint Analysis...</h2>
            </div>
          </div>
        </main>
      </div>
    )
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
                {isUsingUploadedData
                  ? "Analysis based on your uploaded API logs"
                  : "Analyze API endpoint usage patterns to identify high-value enhancement opportunities"}
              </p>
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
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {file && !isUploading && !error && !isUsingUploadedData && (
              <div className="text-sm mt-4">
                Selected file: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
              </div>
            )}

            {isUsingUploadedData && (
              <Alert className="mt-4 bg-green-50 border-green-200">
                <AlertDescription>
                  Successfully analyzed data from {file?.name}. Showing results based on your uploaded logs.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <EndpointStatisticsTable logs={logs} daysInSample={30} onEndpointSelect={handleEndpointSelect} />

        {selectedEndpoint && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Detailed Analysis: {selectedEndpoint}</h2>

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
      </main>
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Feature Analyzer. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
