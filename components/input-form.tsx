"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"

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
  const [loading, setLoading] = useState(false)

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
    // Sample data for Recki - a social product recommendation platform
    setFormData({
      systemType: "Recki - Social Product Recommendation Platform",
      clientDescription:
        "Recki is a social product recommendation platform where users can discover products recommended by friends, share products they like, save items for later, and make purchases.",
      userStories: `User Story 1: Discover Products from Friends

 As a user, I want to see product recommendations from my friends so I can discover trusted items.

Acceptance Criteria:

 [ ] I can view a feed of products shared by friends.
 [ ] Each product shows who recommended it.
 [ ] I can click on a product to view more details.


User Story 2: Share a Product I Like

 As a user, I want to share a product I like so others can benefit from my recommendation.

Acceptance Criteria:

 [ ] I can search for a product to recommend.
 [ ] I can add a personal comment or review.
 [ ] I can post it to my profile/feed.


### User Story 3: Save Products for Later

 As a user, I want to save products to a list so I can buy them later.

Acceptance Criteria:

 [ ] I can add a product to a wishlist or buy list.
 [ ] I can view all saved products in one place.
 [ ] I can remove products from the list if needed.


### User Story 4: Buy a Recommended Product

As a user, I want to buy a product directly from Recki so I don't have to search for it elsewhere.
Acceptance Criteria:
 [ ] I can click a "Buy Now" or link button on product pages.
[ ] I'm redirected to a purchase page or partner store.
 [ ] The product info is clearly displayed before purchase.


User Story 5: Explore New Recommendations

 As a user, I want to explore popular or trending products to find new ideas.

Acceptance Criteria:

 [ ] There is a Discover or Explore section in the app.
 [ ] I can browse by category (e.g., tech, fashion).
 [ ] I can see who recommended each item.`,
      apiDocs: `openapi: 3.0.0
info:
  title: Recki API
  version: 1.0.0
  description: API for social product recommendation platform - Recki

servers:
  - url: https://api.recki.com/v1

paths:
  /auth/register:
    post:
      summary: Register a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '201':
          description: User registered successfully

  /auth/login:
    post:
      summary: Login user and return auth token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string

  /products:
    get:
      summary: Get list of products
      responses:
        '200':
          description: List of products
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Product'

  /recommendations:
    post:
      summary: Create a new product recommendation
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                userId:
                  type: string
                productId:
                  type: string
                comment:
                  type: string
      responses:
        '201':
          description: Recommendation created

    get:
      summary: Get all recommendations
      responses:
        '200':
          description: List of recommendations
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Recommendation'

components:
  schemas:
    Product:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
        imageUrl:
          type: string
        productUrl:
          type: string
        category:
          type: string

    Recommendation:
      type: object
      properties:
        id:
          type: string
        userId:
          type: string
        productId:
          type: string
        comment:
          type: string
        createdAt:
          type: string
          format: date-time`,
      dbSchema: `-- 1. Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  profile_picture TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  product_url TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Recommendations Table
CREATE TABLE recommendations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Likes Table (users liking recommendations)
CREATE TABLE likes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, recommendation_id)
);

-- 5. Follows Table (users following other users)
CREATE TABLE follows (
  id UUID PRIMARY KEY,
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (follower_id, following_id)
);

-- 6. Saved Items (Wishlist/Buy Later)
CREATE TABLE saved_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, product_id)
);`,
    })
  }

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false)

      // Create feature reports based on the user stories
      const features = [
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
          userStories: [
            "As a user, I want to see product recommendations from my friends so I can discover trusted items.",
          ],
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
          userStories: [
            "As a user, I want to buy a product directly from Recki so I don't have to search for it elsewhere.",
          ],
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

      // Encode and pass the features to the results page
      const encodedFeatures = encodeURIComponent(JSON.stringify(features))
      router.push(`/results?features=${encodedFeatures}`)
    }, 2000)
  }

  const isFormValid = () => {
    return formData.systemType.trim() !== "" && formData.clientDescription.trim() !== ""
  }

  const handleLoadSampleData = () => {
    setLoading(true)
    // Simulate loading sample data
    setTimeout(() => {
      setLoading(false)
      router.push("/results")
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <InputSection
        label="System Type"
        placeholder="Enter system type (e.g., Social Product Recommendation Platform)"
        tooltip="Describe the system (e.g., Social Product Recommendation Platform or E-commerce)"
        value={formData.systemType}
        onChange={(e) => handleInputChange("systemType", e.target.value)}
        onFileUpload={(file) => handleFileUpload("systemType", file)}
        acceptTypes=".txt,.md"
      />

      <InputSection
        label="Client Description"
        placeholder="Paste client description here (e.g., 'A platform where users can discover products recommended by friends')..."
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
      <Card>
        <CardContent className="pt-6">
          <Button onClick={handleLoadSampleData} className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Load Sample Data"}
          </Button>
        </CardContent>
      </Card>
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
