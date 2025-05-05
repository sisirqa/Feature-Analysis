"use client"

import { useState } from "react"
import { BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import FeatureAnalyzerModal from "@/components/feature-analyzer-modal"

interface AnalyzeFeatureButtonProps {
  featureId: string
  featureName: string
  featureDetails: string
}

export default function AnalyzeFeatureButton({ featureId, featureName, featureDetails }: AnalyzeFeatureButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <BarChart2 className="h-4 w-4" />
          <span>Analyze Feature</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Feature Analysis: {featureName}</DialogTitle>
        </DialogHeader>
        <FeatureAnalyzerModal
          featureId={featureId}
          featureName={featureName}
          featureDetails={featureDetails}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
