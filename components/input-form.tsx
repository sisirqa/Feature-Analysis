"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function InputForm() {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [formData, setFormData] = useState({
    systemType: "",
    clientDescription: "",
    dbSchema: "",
    userStories: "",
    apiDocs: "",
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

  const loadSampleData = () => {
    setFormData({
      systemType: "Digital Wallet",
      clientDescription:
        "Add international transfers with support for multiple currencies and real-time exchange rates.",
      dbSchema:
        "CREATE TABLE users (\n  id INT PRIMARY KEY,\n  name VARCHAR(100),\n  email VARCHAR(100),\n  balance DECIMAL(10,2)\n);\n\nCREATE TABLE transactions (\n  id INT PRIMARY KEY,\n  user_id INT,\n  amount DECIMAL(10,2),\n  type VARCHAR(50),\n  created_at TIMESTAMP,\n  FOREIGN KEY (user_id) REFERENCES users(id)\n);",
      userStories:
        "As a user, I want to transfer money internationally so that I can send funds to family abroad.\n\nAs a user, I want to see real-time exchange rates so that I know how much money will be received.",
      apiDocs:
        "openapi: 3.0.0\ninfo:\n  title: Wallet API\n  version: 1.0.0\npaths:\n  /transactions:\n    post:\n      summary: Create a new transaction\n      requestBody:\n        content:\n          application/json:\n            schema:\n              type: object\n              properties:\n                amount:\n                  type: number\n                type:\n                  type: string",
    })
  }

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false)
      router.push("/results")
    }, 2000)
  }

  const isFormValid = () => {
    return formData.systemType.trim() !== "" && formData.clientDescription.trim() !== ""
  }

  return (
    <div className="space-y-6">
      <InputSection
        label="System Type"
        placeholder="Enter system type (e.g., Digital Wallet)"
        tooltip="Describe the system (e.g., Digital Wallet or eCommerce Platform)"
        value={formData.systemType}
        onChange={(e) => handleInputChange("systemType", e.target.value)}
        onFileUpload={(file) => handleFileUpload("systemType", file)}
        acceptTypes=".txt,.md"
      />

      <InputSection
        label="Client Description"
        placeholder="Paste client description here (e.g., 'Add international transfers')..."
        tooltip="Provide the client's desired features or enhancements"
        value={formData.clientDescription}
        onChange={(e) => handleInputChange("clientDescription", e.target.value)}
        onFileUpload={(file) => handleFileUpload("clientDescription", file)}
        acceptTypes=".txt,.md"
      />

      <InputSection
        label="Database Schema"
        placeholder="Paste SQL schema here..."
        tooltip="Upload or paste the database schema in SQL format"
        value={formData.dbSchema}
        onChange={(e) => handleInputChange("dbSchema", e.target.value)}
        onFileUpload={(file) => handleFileUpload("dbSchema", file)}
        acceptTypes=".sql,.txt"
      />

      <InputSection
        label="User Stories"
        placeholder="Paste user stories here..."
        tooltip="Upload or paste user stories in TXT or MD format"
        value={formData.userStories}
        onChange={(e) => handleInputChange("userStories", e.target.value)}
        onFileUpload={(file) => handleFileUpload("userStories", file)}
        acceptTypes=".txt,.md"
      />

      <InputSection
        label="API Documentation"
        placeholder="Paste Swagger YAML/JSON here..."
        tooltip="Upload or paste Swagger API docs in YAML/JSON format"
        value={formData.apiDocs}
        onChange={(e) => handleInputChange("apiDocs", e.target.value)}
        onFileUpload={(file) => handleFileUpload("apiDocs", file)}
        acceptTypes=".yaml,.json,.txt"
      />

      <div className="flex justify-between mt-6">
        <Button variant="secondary" onClick={loadSampleData}>
          Load Sample Data
        </Button>
        <Button onClick={handleAnalyze} disabled={!isFormValid() || isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze"
          )}
        </Button>
      </div>
    </div>
  )
}

interface InputSectionProps {
  label: string
  placeholder: string
  tooltip: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onFileUpload: (file: File) => void
  acceptTypes: string
}

function InputSection({ label, placeholder, tooltip, value, onChange, onFileUpload, acceptTypes }: InputSectionProps) {
  return (
    <Card className="border">
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor={label.replace(/\s+/g, "-").toLowerCase()} className="font-bold">
              {label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="cursor-help">
                  <span className="text-xs text-muted-foreground">ⓘ</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea
            id={label.replace(/\s+/g, "-").toLowerCase()}
            placeholder={placeholder}
            className="min-h-[150px] resize-y"
            value={value}
            onChange={onChange}
          />
          <div className="pt-2">
            <Label htmlFor={`upload-${label.replace(/\s+/g, "-").toLowerCase()}`} className="block text-sm mb-1">
              Or upload a file:
            </Label>
            <Input
              id={`upload-${label.replace(/\s+/g, "-").toLowerCase()}`}
              type="file"
              accept={acceptTypes}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onFileUpload(file)
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
