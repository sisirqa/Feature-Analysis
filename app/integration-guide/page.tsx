import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function IntegrationGuidePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Feature Analyzer Integration Guide</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              This guide explains how to integrate the Feature Analyzer into your existing feature management system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              The Feature Analyzer has been designed to work seamlessly with your existing feature management interface.
              It adds a new "Analyze Feature" button next to each feature in your list, allowing project managers to
              quickly analyze features without leaving the current workflow.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration Steps</CardTitle>
            <CardDescription>Follow these steps to integrate the Feature Analyzer into your system.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-4">
              <li>
                <h3 className="font-medium">Add the Analyze Feature Button Component</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Import and add the AnalyzeFeatureButton component to your feature list component:
                </p>
                <pre className="bg-muted p-4 rounded-md mt-2 text-sm overflow-x-auto">
                  {`import AnalyzeFeatureButton from "@/components/analyze-feature-button"`}
                </pre>
                <pre className="bg-muted p-4 rounded-md mt-2 text-sm overflow-x-auto">
                  {`<AnalyzeFeatureButton 
  featureId={feature.id} 
  featureName={feature.name} 
  featureDetails={feature.details} 
/>`}
                </pre>
              </li>

              <li>
                <h3 className="font-medium">Connect to Your Data Sources</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Modify the FeatureAnalyzerModal component to fetch data from your existing API endpoints:
                </p>
                <pre className="bg-muted p-4 rounded-md mt-2 text-sm overflow-x-auto">
                  {`// In feature-analyzer-modal.tsx
const fetchFeatureData = async (featureId) => {
  // Replace with your actual API endpoint
  const response = await fetch(\`/api/features/\${featureId}/analysis\`);
  return response.json();
};`}
                </pre>
              </li>

              <li>
                <h3 className="font-medium">Customize the Analysis Logic</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Modify the analysis logic to match your specific requirements and data structure:
                </p>
                <pre className="bg-muted p-4 rounded-md mt-2 text-sm overflow-x-auto">
                  {`// Example API route implementation
export async function GET(request, { params }) {
  const featureId = params.featureId;
  
  // Fetch feature data from your database
  const feature = await db.features.findUnique({
    where: { id: featureId },
    include: {
      userStories: true,
      acceptanceCriteria: true,
      apiDocs: true,
    },
  });
  
  // Perform analysis
  const analysisResults = analyzeFeature(feature);
  
  return Response.json(analysisResults);
}`}
                </pre>
              </li>

              <li>
                <h3 className="font-medium">Add Permissions (Optional)</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  If needed, add permission checks to control who can access the feature analysis functionality:
                </p>
                <pre className="bg-muted p-4 rounded-md mt-2 text-sm overflow-x-auto">
                  {`// In analyze-feature-button.tsx
const userCanAnalyze = checkUserPermission(currentUser, 'analyze_features');

return (
  {userCanAnalyze ? (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Dialog content */}
    </Dialog>
  ) : null}
);`}
                </pre>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testing the Integration</CardTitle>
            <CardDescription>How to test that the integration is working correctly.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Navigate to your feature list page</li>
              <li>Verify that each feature row now has an "Analyze Feature" button</li>
              <li>Click the button for a feature to open the analysis modal</li>
              <li>Test the analysis functionality by clicking "Start Analysis"</li>
              <li>Verify that the analysis results are displayed correctly</li>
              <li>Test the PDF export functionality</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
