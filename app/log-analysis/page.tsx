import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/header"
import LogAnalysis from "@/components/log-analysis"

export default function LogAnalysisPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">Access Log Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Analyze access logs to determine feature usage patterns and make data-driven enhancement decisions
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <LogAnalysis />
          </CardContent>
        </Card>
      </main>
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Feature Analyzer. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
