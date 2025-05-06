"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, BarChart2 } from "lucide-react"
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
    // Sample features from the feature list
    const features = [
      {
        id: "1",
        name: "Browser Change OTP",
        details: "Agent portal - Similar feature as new device OTP for Customer.",
      },
      {
        id: "2",
        name: "Vendor API - MYRA",
        details: "All the task and changes to be done on vendor api",
      },
      {
        id: "3",
        name: "NRB report update",
        details:
          "Update NRB reports according to the provided excel format Reports to be updated : Transaction Report Success/Failure Report Agent Report",
      },
      {
        id: "4",
        name: "Compliance Changes",
        details: "This involves all the changes and features introduced to fulfill NRB compliance for citypay",
      },
      {
        id: "5",
        name: "Password Reset Config",
        details:
          "Admin should be able to manage the configuration of password reset from the CMS. This should be for both Agent portal and customer portal.",
      },
      {
        id: "6",
        name: "Dynamic QR - Merchant",
        details: "Merchants should now be able to generate the dynamic QR.",
      },
      {
        id: "7",
        name: "Customer onboarding consent",
        details: "Implement consent form during customer onboarding process",
      },
      {
        id: "8",
        name: "Two-Factor Authentication (2FA) for Admin Portal",
        details: "Implement 2FA security for admin portal access",
      },
      {
        id: "9",
        name: "NCHL QR Code format",
        details: "Implement NCHL QR code format standards",
      },
      {
        id: "10",
        name: "FonePay QR payment",
        details: "Integrate FonePay QR payment system",
      },
    ]

    // Format features as user stories
    const userStories = features
      .map((feature) => {
        // Convert feature details to user story format
        let story = `Feature: ${feature.name}\n`
        story += `Description: ${feature.details}\n\n`

        // Add user story format based on the feature
        switch (feature.id) {
          case "1":
            story +=
              "As an agent, I want to verify my identity when changing browsers so that my account remains secure.\n"
            story += "Acceptance Criteria:\n"
            story += "- System should detect when agent logs in from a new browser\n"
            story += "- OTP should be sent to agent's registered mobile number\n"
            story += "- Agent should be able to enter OTP to verify identity\n"
            story += "- Session should be authorized after successful verification\n"
            break
          case "2":
            story +=
              "As a system administrator, I want to integrate with MYRA vendor API so that required services are available.\n"
            story += "Acceptance Criteria:\n"
            story += "- System should connect to MYRA API endpoints\n"
            story += "- Authentication with MYRA services should be secure\n"
            story += "- All required data should be exchanged correctly\n"
            story += "- Error handling should be implemented for API failures\n"
            break
          case "3":
            story += "As a compliance officer, I want updated NRB reports so that regulatory requirements are met.\n"
            story += "Acceptance Criteria:\n"
            story += "- Transaction Report format should match provided excel template\n"
            story += "- Success/Failure Report should include all required fields\n"
            story += "- Agent Report should be generated according to specifications\n"
            story += "- Reports should be exportable in required formats\n"
            break
          case "4":
            story +=
              "As a compliance manager, I want NRB compliance features implemented so that citypay meets regulatory requirements.\n"
            story += "Acceptance Criteria:\n"
            story += "- All required compliance checks should be implemented\n"
            story += "- Transaction monitoring should meet NRB guidelines\n"
            story += "- Reporting mechanisms should be compliant with regulations\n"
            story += "- Audit trail should be maintained for all compliance activities\n"
            break
          case "5":
            story +=
              "As an admin, I want to configure password reset options so that both agents and customers can securely reset passwords.\n"
            story += "Acceptance Criteria:\n"
            story += "- Admin should be able to set password complexity requirements\n"
            story += "- Admin should be able to configure reset methods (email, SMS, etc.)\n"
            story += "- Configuration should apply to both agent portal and customer portal\n"
            story += "- Changes should be logged for audit purposes\n"
            break
          default:
            story += `As a user, I want to use the ${feature.name} feature so that I can ${feature.details.toLowerCase()}\n`
            story += "Acceptance Criteria:\n"
            story += "- Feature should be accessible from the appropriate section\n"
            story += "- Feature should perform as described in the requirements\n"
            story += "- User should receive appropriate feedback when using the feature\n"
            story += "- Feature should handle errors gracefully\n"
        }

        story += "\n---\n"
        return story
      })
      .join("\n")

    setFormData({
      systemType: "Citypay Payment Platform",
      clientDescription:
        "Citypay is a digital payment platform that needs to implement several new features to enhance security, compliance, and user experience.",
      dbSchema:
        "CREATE TABLE users (\n  id INT PRIMARY KEY,\n  name VARCHAR(100),\n  email VARCHAR(100),\n  phone VARCHAR(20),\n  role VARCHAR(50)\n);\n\nCREATE TABLE transactions (\n  id INT PRIMARY KEY,\n  user_id INT,\n  amount DECIMAL(10,2),\n  type VARCHAR(50),\n  status VARCHAR(20),\n  created_at TIMESTAMP,\n  FOREIGN KEY (user_id) REFERENCES users(id)\n);",
      userStories: userStories,
      apiDocs:
        "openapi: 3.0.0\ninfo:\n  title: Citypay API\n  version: 1.0.0\npaths:\n  /auth/otp:\n    post:\n      summary: Send OTP for verification\n      requestBody:\n        content:\n          application/json:\n            schema:\n              type: object\n              properties:\n                userId:\n                  type: string\n                deviceId:\n                  type: string",
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
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadSampleData}>
            Load Sample Data
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/endpoint-analysis")}
            className="flex items-center gap-2"
          >
            <BarChart2 className="h-4 w-4" />
            API Endpoint Analysis
          </Button>
        </div>
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
