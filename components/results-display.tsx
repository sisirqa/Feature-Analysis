"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function ResultsDisplay() {
  const [activeTab, setActiveTab] = useState("summary")

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Feature Analysis Report</h2>
        <p className="text-muted-foreground mt-2">Analysis of client-requested feature enhancements</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Analysis Complete</AlertTitle>
        <AlertDescription>
          The feature analysis has been completed successfully. Review the results below.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="summary" className="mt-6">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                The client has requested international transfer capabilities for their Digital Wallet system. This
                enhancement would require significant changes to the transaction processing system, database schema, and
                API endpoints. The feature has high business value but introduces moderate technical complexity and
                security considerations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Request Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                The client has requested adding international transfers with support for multiple currencies and
                real-time exchange rates to their Digital Wallet platform. This would enable users to send money across
                borders, expanding the utility of the platform significantly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Context</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                The current system is a Digital Wallet platform that supports domestic transfers and basic account
                management. The database includes user accounts and transaction records, but lacks currency conversion
                and international routing capabilities.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 mb-4">
                <h3 className="font-medium mb-2">Client-Requested Features (RICE scores)</h3>
                <div className="bg-muted p-4 rounded-md text-center">[Bar Chart: RICE Scores for Features]</div>
                <table className="w-full mt-4 border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Feature</th>
                      <th className="text-left py-2">Reach</th>
                      <th className="text-left py-2">Impact</th>
                      <th className="text-left py-2">Confidence</th>
                      <th className="text-left py-2">Effort</th>
                      <th className="text-left py-2">RICE Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">International Transfers</td>
                      <td className="py-2">8</td>
                      <td className="py-2">9</td>
                      <td className="py-2">8</td>
                      <td className="py-2">7</td>
                      <td className="py-2">8.2</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Currency Conversion</td>
                      <td className="py-2">8</td>
                      <td className="py-2">7</td>
                      <td className="py-2">9</td>
                      <td className="py-2">5</td>
                      <td className="py-2">10.1</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Real-time Exchange Rates</td>
                      <td className="py-2">7</td>
                      <td className="py-2">6</td>
                      <td className="py-2">8</td>
                      <td className="py-2">4</td>
                      <td className="py-2">8.4</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Effort vs. Impact Analysis</h3>
                <div className="bg-muted p-4 rounded-md text-center">[Scatter Plot: Effort vs. Impact]</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 mb-4">
                <h3 className="font-medium mb-2">Identified Risks</h3>
                <div className="bg-muted p-4 rounded-md text-center mb-4">[Pie Chart: Risk Distribution]</div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Risk</th>
                      <th className="text-left py-2">Severity</th>
                      <th className="text-left py-2">Probability</th>
                      <th className="text-left py-2">Mitigation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Currency fluctuation</td>
                      <td className="py-2">Medium</td>
                      <td className="py-2">High</td>
                      <td className="py-2">Implement rate caching and alerts for significant changes</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Regulatory compliance</td>
                      <td className="py-2">High</td>
                      <td className="py-2">Medium</td>
                      <td className="py-2">Engage legal team for country-specific requirements</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Transaction security</td>
                      <td className="py-2">High</td>
                      <td className="py-2">Low</td>
                      <td className="py-2">Implement additional verification for international transfers</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 mb-4">
                <h3 className="font-medium mb-2">Affected Components</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Component</th>
                      <th className="text-left py-2">Impact Level</th>
                      <th className="text-left py-2">Changes Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">Database Schema</td>
                      <td className="py-2">High</td>
                      <td className="py-2">Add currency tables, modify transaction schema</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">API Endpoints</td>
                      <td className="py-2">Medium</td>
                      <td className="py-2">Add international transfer endpoints, currency conversion</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">User Interface</td>
                      <td className="py-2">Medium</td>
                      <td className="py-2">Add currency selection, exchange rate display</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Security Layer</td>
                      <td className="py-2">High</td>
                      <td className="py-2">Enhance verification for international transfers</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">DB Schema Changes</h3>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                  {`-- Add currencies table
CREATE TABLE currencies (
  code CHAR(3) PRIMARY KEY,
  name VARCHAR(50),
  symbol VARCHAR(5)
);

-- Add exchange rates table
CREATE TABLE exchange_rates (
  from_currency CHAR(3),
  to_currency CHAR(3),
  rate DECIMAL(10,6),
  last_updated TIMESTAMP,
  PRIMARY KEY (from_currency, to_currency),
  FOREIGN KEY (from_currency) REFERENCES currencies(code),
  FOREIGN KEY (to_currency) REFERENCES currencies(code)
);

-- Modify transactions table
ALTER TABLE transactions 
ADD COLUMN currency_code CHAR(3),
ADD COLUMN exchange_rate DECIMAL(10,6),
ADD COLUMN is_international BOOLEAN DEFAULT FALSE,
ADD FOREIGN KEY (currency_code) REFERENCES currencies(code);`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Prioritized Next Steps</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Implement database schema changes to support multiple currencies</li>
                    <li>Integrate with a reliable exchange rate API for real-time rates</li>
                    <li>Develop the backend API endpoints for international transfers</li>
                    <li>Enhance security measures for international transactions</li>
                    <li>Update the user interface to support currency selection</li>
                    <li>Implement comprehensive testing with focus on edge cases</li>
                  </ol>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Implementation Timeline</h3>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Phase</th>
                        <th className="text-left py-2">Duration</th>
                        <th className="text-left py-2">Key Deliverables</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">Planning & Design</td>
                        <td className="py-2">2 weeks</td>
                        <td className="py-2">Technical specifications, API design</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Database Implementation</td>
                        <td className="py-2">1 week</td>
                        <td className="py-2">Schema changes, data migration</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Backend Development</td>
                        <td className="py-2">3 weeks</td>
                        <td className="py-2">API endpoints, integration with exchange rate service</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Frontend Development</td>
                        <td className="py-2">2 weeks</td>
                        <td className="py-2">UI updates, currency selection, rate display</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Testing & QA</td>
                        <td className="py-2">2 weeks</td>
                        <td className="py-2">Unit tests, integration tests, security audit</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Deployment</td>
                        <td className="py-2">1 week</td>
                        <td className="py-2">Staged rollout, monitoring</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Resource Requirements</h3>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Resource</th>
                        <th className="text-left py-2">Allocation</th>
                        <th className="text-left py-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">Backend Developers</td>
                        <td className="py-2">2 FTE</td>
                        <td className="py-2">Focus on API and database changes</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Frontend Developers</td>
                        <td className="py-2">1 FTE</td>
                        <td className="py-2">UI updates for currency handling</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">QA Engineers</td>
                        <td className="py-2">1 FTE</td>
                        <td className="py-2">Testing international scenarios</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">DevOps</td>
                        <td className="py-2">0.5 FTE</td>
                        <td className="py-2">Deployment and monitoring</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Legal/Compliance</td>
                        <td className="py-2">Consulting</td>
                        <td className="py-2">International regulations review</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
