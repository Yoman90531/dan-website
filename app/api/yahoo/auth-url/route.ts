import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are set
    const clientId = process.env.YAHOO_CLIENT_ID
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    // Log environment variables for debugging (don't include this in production)
    console.log("Environment variables check:", {
      clientIdExists: !!clientId,
      appUrlExists: !!appUrl,
      appUrlValue: appUrl,
    })

    if (!clientId) {
      console.error("Missing YAHOO_CLIENT_ID environment variable")
      return NextResponse.json({ error: "Missing YAHOO_CLIENT_ID environment variable" }, { status: 500 })
    }

    if (!appUrl) {
      console.error("Missing NEXT_PUBLIC_APP_URL environment variable")
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_APP_URL environment variable" }, { status: 500 })
    }

    const redirectUri = `${appUrl}/api/yahoo/callback`

    // Create the authorization URL
    const authUrl = new URL("https://api.login.yahoo.com/oauth2/request_auth")
    authUrl.searchParams.append("client_id", clientId)
    authUrl.searchParams.append("redirect_uri", redirectUri)
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("language", "en-us")

    // Return the URL as JSON
    return NextResponse.json({ url: authUrl.toString() })
  } catch (error) {
    // Log the detailed error
    console.error("Error in auth-url endpoint:", error)

    // Return a more detailed error message
    return NextResponse.json(
      {
        error: "Failed to generate authentication URL",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
