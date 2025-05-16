"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function YahooAuthTestPage() {
  const [authUrl, setAuthUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  const generateAuthUrl = async () => {
    try {
      setLoading(true)
      setError(null)
      addLog("Generating auth URL...")

      const clientId =
        "dj0yJmk9b3l4aHJwN1lxN1hqJmQ9WVdrOVdFTnFZbGRDVGpZbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PTgy"
      const redirectUri = "https://www.dansandbox.app/yahoo-auth-test/callback"

      // Generate the URL directly in the client
      const authUrl = new URL("https://api.login.yahoo.com/oauth2/request_auth")
      authUrl.searchParams.append("client_id", clientId)
      authUrl.searchParams.append("redirect_uri", redirectUri)
      authUrl.searchParams.append("response_type", "code")
      authUrl.searchParams.append("language", "en-us")

      setAuthUrl(authUrl.toString())
      addLog(`Auth URL generated: ${authUrl.toString()}`)
    } catch (error) {
      console.error("Error generating auth URL:", error)
      setError(`Error generating auth URL: ${error instanceof Error ? error.message : String(error)}`)
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if we have a code or error in the URL (after redirect back from Yahoo)
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    const authError = urlParams.get("error")

    if (code) {
      addLog(`Received authorization code: ${code.substring(0, 10)}...`)
    }

    if (authError) {
      setError(`Authentication error: ${authError}`)
      addLog(`Authentication error: ${authError}`)
    }
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Yahoo Authentication Test</CardTitle>
          <CardDescription>Simple test for Yahoo OAuth authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button onClick={generateAuthUrl} disabled={loading}>
              {loading ? "Generating..." : "Generate Auth URL"}
            </Button>

            {authUrl && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="font-medium mb-2">Authentication URL:</p>
                <p className="text-sm break-all">{authUrl}</p>
                <Button className="mt-4" onClick={() => window.open(authUrl, "_blank")}>
                  Open Auth URL in New Tab
                </Button>
              </div>
            )}
          </div>

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
        </CardContent>
      </Card>
    </div>
  )
}
