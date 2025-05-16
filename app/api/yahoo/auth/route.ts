import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get environment variables
    const clientId = process.env.YAHOO_CLIENT_ID
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!clientId || !appUrl) {
      console.error("Missing required environment variables:", {
        clientIdExists: !!clientId,
        appUrlExists: !!appUrl,
      })
      return NextResponse.json({ error: "Missing required environment variables" }, { status: 500 })
    }

    // Create the callback URL
    const redirectUri = `${appUrl}/api/yahoo/callback`

    // Create the authorization URL
    const authUrl = new URL("https://api.login.yahoo.com/oauth2/request_auth")
    authUrl.searchParams.append("client_id", clientId)
    authUrl.searchParams.append("redirect_uri", redirectUri)
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("language", "en-us")

    // Return the URL
    return NextResponse.json({ url: authUrl.toString() })
  } catch (error) {
    console.error("Error generating auth URL:", error)
    return NextResponse.json({ error: "Failed to generate authentication URL" }, { status: 500 })
  }
}
