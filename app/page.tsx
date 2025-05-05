import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/header"
import InputForm from "@/components/input-form"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <InputForm />
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
