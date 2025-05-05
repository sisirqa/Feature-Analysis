"use client"

import { useState } from "react"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import UserStoryAnalysisForm from "@/components/user-story-analysis-form"

interface AnalyzeUserStoryButtonProps {
  featureId: string
  featureName: string
}

export default function AnalyzeUserStoryButton({ featureId, featureName }: AnalyzeUserStoryButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span>User Story</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Analyze User Story</DialogTitle>
        </DialogHeader>
        <UserStoryAnalysisForm featureId={featureId} featureName={featureName} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
