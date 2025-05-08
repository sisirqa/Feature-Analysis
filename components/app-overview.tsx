import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileCheckIcon, BarChart3Icon, AlertTriangleIcon, ArrowRightIcon } from "lucide-react"

interface AppOverviewProps {
  features?: any[]
}

export default function AppOverview({ features = [] }: AppOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Welcome to Feature Analyzer</h2>
        <p className="text-muted-foreground mt-2">Analyze client-requested feature enhancements for software systems</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Input Data</CardTitle>
            <FileCheckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Step 1</div>
            <p className="text-xs text-muted-foreground">
              Enter system details, client requirements, and technical specifications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analysis</CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Step 2</div>
            <p className="text-xs text-muted-foreground">
              Our system analyzes the data to identify features, risks, and impacts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Results</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Step 3</div>
            <p className="text-xs text-muted-foreground">
              Review comprehensive analysis with visualizations and recommendations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Export</CardTitle>
            <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Step 4</div>
            <p className="text-xs text-muted-foreground">
              Export your analysis as a professional PDF report for stakeholders
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Feature Analyzer helps Project Managers evaluate client-requested feature enhancements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-md p-4 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
                <h3 className="font-medium mb-2">Input Collection</h3>
                <p className="text-sm text-muted-foreground">
                  Enter system type, client description, database schema, user stories, and API documentation
                </p>
              </div>
              <div className="border rounded-md p-4 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
                <h3 className="font-medium mb-2">Analysis Process</h3>
                <p className="text-sm text-muted-foreground">
                  Our system analyzes the inputs to identify features, calculate RICE scores, assess risks, and
                  determine impacts
                </p>
              </div>
              <div className="border rounded-md p-4 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
                <h3 className="font-medium mb-2">Visualization & Reporting</h3>
                <p className="text-sm text-muted-foreground">
                  Review results with interactive charts and export a professional PDF report for stakeholders
                </p>
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Key Benefits</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Standardized approach to feature analysis</li>
                <li>Data-driven prioritization using RICE scoring methodology</li>
                <li>Comprehensive risk and impact assessment</li>
                <li>Visual representations for better stakeholder communication</li>
                <li>Professional reports ready for executive presentation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
