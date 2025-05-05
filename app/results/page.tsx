import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/header"
import ResultsDisplay from "@/components/results-display"

export default function ResultsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-4 flex justify-between items-center">
          <Link href="/">
            <Button variant="outline">Back to Input</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ResultsDisplay />
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
