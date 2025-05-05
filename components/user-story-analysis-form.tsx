"use client"

import type React from "react"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserStoryAnalysisFormProps {
  featureId: string
  featureName: string
  onClose: () => void
}

export default function UserStoryAnalysisForm({ featureId, featureName, onClose }: UserStoryAnalysisFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [formData, setFormData] = useState({
    userStoryId: "",
    description: "",
    dbSchema: "",
    swaggerLink: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      handleInputChange(field, content)
    }
    reader.readAsText(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsAnalyzed(true)
    } catch (error) {
      console.error("Error analyzing user story:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFetchUserStory = async () => {
    if (!formData.userStoryId) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mock data
      setFormData((prev) => ({
        ...prev,
        description: "As a user, I want to reset my password so I can regain access to my account if forgotten.",
      }))
    } catch (error) {
      console.error("Error fetching user story:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isAnalyzed) {
    return (
      <div className="space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription>Analysis complete! Results available in the feature analysis section.</AlertDescription>
        </Alert>
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="userStoryId">User Story ID</Label>
          <Input
            id="userStoryId"
            value={formData.userStoryId}
            onChange={(e) => handleInputChange("userStoryId", e.target.value)}
            placeholder="Enter ID"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleFetchUserStory}
          disabled={!formData.userStoryId || isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
        </Button>
      </div>

      <Tabs defaultValue="story" className="w-full">
        <TabsList className="grid grid-cols-3 mb-2">
          <TabsTrigger value="story">Story</TabsTrigger>
          <TabsTrigger value="db">DB Schema</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="story" className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="As a [role], I want to [action] so that [benefit]"
              className="min-h-[100px]"
            />
          </div>
        </TabsContent>

        <TabsContent value="db" className="space-y-4">
          <div>
            <Label className="flex justify-between">
              <span>DB Schema</span>
              <Input
                type="file"
                accept=".sql,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload("dbSchema", file)
                }}
                className="w-auto text-xs"
              />
            </Label>
            <Textarea
              value={formData.dbSchema}
              onChange={(e) => handleInputChange("dbSchema", e.target.value)}
              placeholder="Paste SQL schema here or upload a file"
              className="min-h-[100px] font-mono text-sm"
            />
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div>
            <Label htmlFor="swaggerLink">Swagger Link</Label>
            <Input
              id="swaggerLink"
              value={formData.swaggerLink}
              onChange={(e) => handleInputChange("swaggerLink", e.target.value)}
              placeholder="https://example.com/swagger.json"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze"
          )}
        </Button>
      </div>
    </form>
  )
}
