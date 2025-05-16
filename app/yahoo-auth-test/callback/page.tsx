"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function YahooAuthCallbackPage() {
  const [code, setCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  useEffect(() => {
    // Extract code and error from URL
    const urlParams = new URLSearchParams(window.location.search)
    const authCode = urlParams.get("code")
    const authError = urlParams.get("error")

    if (authCode) {
      setCode(authCode)
      addLog(`Received authorization code: ${authCode.substring(0, 10)}...`)
    }

    if (authError) {
      setError(`Authentication error: ${authError}`)
      addLog(`Authentication error: ${authError}`)
    }

    if (!authCode && !authError) {
      setError("No code or error received in callback")
      addLog("No code or error received in callback")
    }
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Yahoo Authentication Callback</CardTitle>
          <CardDescription>Results of the authentication attempt</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : code ? (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <AlertDescription className="text-green-800">Authentication successful! Code received.</AlertDescription>
            </Alert>
          ) : null}

          {code && (
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="font-medium mb-2">Authorization Code:</p>
              <p className="text-sm break-all">{code}</p>
              <p className="text-xs text-gray-500 mt-2">
                This code can be exchanged for an access token. In a real implementation, this would be done
                server-side.
              </p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-medium mb-2">Debug Logs:</h3>
            <div className="bg-black text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
              {logs.length > 0 ? (
                logs.map((log, index) => <div key={index}>{log}</div>)
              ) : (
                <div className="text-gray-500">No logs yet...</div>
              )}
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <Link href="/yahoo-auth-test">
              <Button>Back to Test Page</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
