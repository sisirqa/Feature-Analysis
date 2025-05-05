"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import AnalyzeFeatureButton from "@/components/analyze-feature-button"
import AnalyzeUserStoryButton from "@/components/analyze-user-story-button"

interface Feature {
  id: string
  sn: number
  name: string
  details: string
  status: string
  completed: string
}

export default function FeatureList() {
  // Sample data from the provided screenshot
  const [features, setFeatures] = useState<Feature[]>([
    {
      id: "1",
      sn: 1,
      name: "Browser Change OTP",
      details: "Agent portal - Similar feature as new device OTP for Customer.",
      status: "In Progress",
      completed: "60%",
    },
    {
      id: "2",
      sn: 2,
      name: "Vendor API - MYRA",
      details: "All the task and changes to be done on vendor api",
      status: "In Progress",
      completed: "50%",
    },
    {
      id: "3",
      sn: 3,
      name: "NRB report update",
      details:
        "Update NRB reports according to the provided excel format Reports to be updated : Transaction Report Success/Failure Report Agent Report",
      status: "In Progress",
      completed: "53%",
    },
    {
      id: "4",
      sn: 4,
      name: "Compliance Changes",
      details: "This involves all the changes and features introduced to fulfill NRB compliance for citypay",
      status: "In Progress",
      completed: "35%",
    },
    {
      id: "5",
      sn: 5,
      name: "Password Reset Config",
      details:
        "Admin should be able to manage the configuration of password reset from the CMS. This should be for both Agent portal and customer portal.",
      status: "In Progress",
      completed: "45%",
    },
    {
      id: "6",
      sn: 6,
      name: "Dynamic QR - Merchant",
      details: "Merchants should now be able to generate the dynamic QR.",
      status: "In Progress",
      completed: "20%",
    },
    {
      id: "7",
      sn: 7,
      name: "Customer onboarding consent",
      details: "Implement consent form during customer onboarding process",
      status: "Not Started",
      completed: "0%",
    },
    {
      id: "8",
      sn: 8,
      name: "Two-Factor Authentication (2FA) for Admin Portal",
      details: "Implement 2FA security for admin portal access",
      status: "Not Started",
      completed: "0%",
    },
    {
      id: "9",
      sn: 9,
      name: "NCHL QR Code format",
      details: "Implement NCHL QR code format standards",
      status: "Not Started",
      completed: "0%",
    },
    {
      id: "10",
      sn: 10,
      name: "FonePay QR payment",
      details: "Integrate FonePay QR payment system",
      status: "Not Started",
      completed: "0%",
    },
  ])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Feature List</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Feature
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">SN</th>
              <th className="text-left p-3">Features</th>
              <th className="text-left p-3">Details</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Completed</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr key={feature.id} className="border-t">
                <td className="p-3">{feature.sn}</td>
                <td className="p-3">{feature.name}</td>
                <td className="p-3">{feature.details}</td>
                <td className="p-3">{feature.status}</td>
                <td className="p-3">{feature.completed}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      View Sub Feature
                    </Button>
                    <AnalyzeFeatureButton
                      featureId={feature.id}
                      featureName={feature.name}
                      featureDetails={feature.details}
                    />
                    <AnalyzeUserStoryButton featureId={feature.id} featureName={feature.name} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
