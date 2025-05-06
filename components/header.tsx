import Link from "next/link"
import { FileCheckIcon as FileAnalysis, BarChart2 } from "lucide-react"

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <FileAnalysis className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Feature Analyzer</h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/endpoint-analysis" className="flex items-center gap-2 text-sm hover:text-primary">
            <BarChart2 className="h-4 w-4" />
            <span>API Analysis</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
