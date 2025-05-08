import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/results" className="font-semibold text-xl">
            Feature Analyzer
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/results">
            <Button variant="ghost">Results</Button>
          </Link>
          <Link href="/endpoint-analysis">
            <Button variant="ghost">API Analysis</Button>
          </Link>
          <Link href="/log-analysis">
            <Button variant="ghost">Log Analysis</Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
