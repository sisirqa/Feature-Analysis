"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Upload, AlertCircle, BarChart2 } from "lucide-react"

interface UploadResponse {
  success: boolean
  message: string
  analysis: {
    totalRequests: number
    uniqueEndpoints: number
    uniqueIPs: number
    uniqueUsers: number
    uniqueDevices: number
    topEndpoints: {
      endpoint: string
      count: number
      avgResponseTime: number
      successRate: number
      methods: Record<string, number>
      users: number
      devices: number
    }[]
    endpointsByResponseTime: {
      endpoint: string
      count: number
      avgResponseTime: number
      successRate: number
    }[]
    endpointsByErrorRate: {
      endpoint: string
      count: number
      successRate: number
    }[]
  }
}

export default function LogUploadForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

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

      setUploadResult(result)
    } catch (err) {
      setError(`Upload failed: ${(err as Error).message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleViewEndpointAnalysis = () => {
    router.push("/endpoint-analysis")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload API Logs</CardTitle>
          <CardDescription>Upload a CSV file containing API logs to analyze endpoint usage patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Input type="file" accept=".csv" onChange={handleFileChange} disabled={isUploading} />
                <p className="text-sm text-muted-foreground mt-1">
                  CSV format with columns: id, _id, ip, userAgent, requestBody, requestEndPoint, responseCode, etc.
                </p>
              </div>
              <div className="flex items-end gap-2">
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
                <Button variant="outline" onClick={handleViewEndpointAnalysis} className="w-full sm:w-auto">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Endpoint Analysis
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {file && !isUploading && !error && !uploadResult && (
              <div className="text-sm">
                Selected file: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Processed {uploadResult.analysis.totalRequests.toLocaleString()} log entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{uploadResult.analysis.totalRequests.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{uploadResult.analysis.uniqueEndpoints.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Unique Endpoints</div>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{uploadResult.analysis.uniqueIPs.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Unique IPs</div>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{uploadResult.analysis.uniqueUsers.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Unique Users</div>
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={handleViewEndpointAnalysis} className="w-full">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View Detailed Endpoint Analysis
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Endpoints by Usage</CardTitle>
              <CardDescription>The most frequently accessed API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Endpoint</th>
                      <th className="text-left py-2 px-4">Count</th>
                      <th className="text-left py-2 px-4">% of Total</th>
                      <th className="text-left py-2 px-4">Avg Response Time</th>
                      <th className="text-left py-2 px-4">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadResult.analysis.topEndpoints.map((endpoint, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4 font-medium">{endpoint.endpoint}</td>
                        <td className="py-2 px-4">{endpoint.count.toLocaleString()}</td>
                        <td className="py-2 px-4">
                          {((endpoint.count / uploadResult.analysis.totalRequests) * 100).toFixed(2)}%
                        </td>
                        <td className="py-2 px-4">{(endpoint.avgResponseTime || 0).toFixed(2)} ms</td>
                        <td className="py-2 px-4">
                          <div className="flex items-center">
                            <div className="w-full bg-secondary rounded-full h-2.5 mr-2 max-w-24">
                              <div
                                className={`h-2.5 rounded-full ${
                                  endpoint.successRate > 95
                                    ? "bg-green-500"
                                    : endpoint.successRate > 80
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${endpoint.successRate || 0}%` }}
                              ></div>
                            </div>
                            <span>{(endpoint.successRate || 0).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
