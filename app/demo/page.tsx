import { Card, CardContent } from "@/components/ui/card"
import FeatureList from "@/components/feature-list"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
            <h1 className="text-xl font-bold">Citypay - Baisakh82</h1>
          </div>
          <div>
            <button className="px-4 py-2 text-sm border rounded-md">View All API Doc</button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <div className="w-64 shrink-0">
            <div className="bg-white border rounded-md p-4">
              <h2 className="text-lg font-medium mb-4">Feature List</h2>
              <ul className="space-y-1">
                <li className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md">Browser Change OTP</li>
                <li className="hover:bg-gray-100 px-3 py-2 rounded-md">Vendor API - MYRA</li>
                <li className="hover:bg-gray-100 px-3 py-2 rounded-md">NRB report update</li>
                <li className="hover:bg-gray-100 px-3 py-2 rounded-md">Compliance Changes</li>
                <li className="hover:bg-gray-100 px-3 py-2 rounded-md">Password Reset Config</li>
                <li className="hover:bg-gray-100 px-3 py-2 rounded-md">Dynamic QR - Merchant</li>
                <li className="hover:bg-gray-100 px-3 py-2 rounded-md">Customer onboarding consent</li>
                <li className="hover:bg-gray-100 px-3 py-2 rounded-md">Two-Factor Authentication (2FA)</li>
                <li className="hover:bg-gray-100 px-3 py-2 rounded-md">NCHL QR Code format</li>
                <li className="hover:bg-gray-100 px-3 py-2 rounded-md">FonePay QR payment</li>
              </ul>
            </div>
          </div>

          <div className="flex-1">
            <Card>
              <CardContent className="pt-6">
                <FeatureList />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
