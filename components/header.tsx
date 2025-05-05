import Link from "next/link"
import { FileCheckIcon as FileAnalysis } from "lucide-react"

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <Link href="/" className="flex items-center gap-2">
          <FileAnalysis className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Feature Analyzer</h1>
        </Link>
      </div>
    </header>
  )
}
