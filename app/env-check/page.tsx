"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EnvCheckPage() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({})

  useEffect(() => {
    // Check which environment variables are available
    const vars = {
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✓ Set" : "✗ Missing",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✓ Set" : "✗ Missing",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✓ Set" : "✗ Missing",
      NEXT_PUBLIC_S3_BUCKET_NAME: process.env.NEXT_PUBLIC_S3_BUCKET_NAME || "✗ Missing",
      NEXT_PUBLIC_S3_REGION: process.env.NEXT_PUBLIC_S3_REGION || "✗ Missing",
      NEXT_PUBLIC_S3_ACCESS_KEY_ID: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID ? "✓ Set (hidden)" : "✗ Missing",
      NEXT_PUBLIC_S3_SECRET_ACCESS_KEY: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY ? "✓ Set (hidden)" : "✗ Missing",
    }
    setEnvVars(vars)
  }, [])

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-bold text-lg mb-4">Firebase Configuration:</h3>
            <div className="space-y-1 mb-6">
              <p>NEXT_PUBLIC_FIREBASE_API_KEY: {envVars.NEXT_PUBLIC_FIREBASE_API_KEY}</p>
              <p>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: {envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}</p>
              <p>NEXT_PUBLIC_FIREBASE_PROJECT_ID: {envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</p>
            </div>

            <h3 className="font-bold text-lg mb-4">AWS S3 Configuration:</h3>
            <div className="space-y-1">
              <p>NEXT_PUBLIC_S3_BUCKET_NAME: {envVars.NEXT_PUBLIC_S3_BUCKET_NAME}</p>
              <p>NEXT_PUBLIC_S3_REGION: {envVars.NEXT_PUBLIC_S3_REGION}</p>
              <p>NEXT_PUBLIC_S3_ACCESS_KEY_ID: {envVars.NEXT_PUBLIC_S3_ACCESS_KEY_ID}</p>
              <p>NEXT_PUBLIC_S3_SECRET_ACCESS_KEY: {envVars.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY}</p>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> If any variables show as "Missing" in production, 
                you need to rebuild with the environment variables set.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
