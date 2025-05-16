import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Get endpoint from query parameters
    const searchParams = request.nextUrl.searchParams
    const endpoint = searchParams.get("endpoint")

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint parameter" }, { status: 400 })
    }

    // Get access token from cookies
    const accessToken = cookies().get("yahoo_access_token")?.value
    const tokenExpiry = cookies().get("yahoo_token_expiry")?.value
    const refreshToken = cookies().get("yahoo_refresh_token")?.value

    // Check if token exists
    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if token is expired
    const expiryTime = Number.parseInt(tokenExpiry || "0")
    if (Date.now() > expiryTime) {
      // Token is expired, but we have a refresh token
      if (refreshToken) {
        return NextResponse.json({ error: "Token expired", needsRefresh: true }, { status: 401 })
      }
      // Token is expired and no refresh token
      return NextResponse.json({ error: "Authentication expired" }, { status: 401 })
    }

    // Construct the full Yahoo Fantasy API URL
    const baseUrl = "https://fantasysports.yahooapis.com/fantasy/v2"
    const fullUrl = `${baseUrl}${endpoint}`

    console.log(`Making request to Yahoo API: ${fullUrl}`)

    // Make the request to Yahoo's API
    const yahooResponse = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    // Handle Yahoo API error
    if (!yahooResponse.ok) {
      const errorText = await yahooResponse.text()
      console.error(`Yahoo API error (${yahooResponse.status}):`, errorText)

      // If unauthorized, clear tokens
      if (yahooResponse.status === 401) {
        cookies().delete("yahoo_access_token")
        cookies().delete("yahoo_token_expiry")
      }

      return NextResponse.json(
        {
          error: "Yahoo API request failed",
          status: yahooResponse.status,
          details: errorText,
        },
        { status: yahooResponse.status },
      )
    }

    // Parse and return the response
    const contentType = yahooResponse.headers.get("content-type")
    let data

    if (contentType?.includes("application/json")) {
      data = await yahooResponse.json()
    } else {
      data = await yahooResponse.text()
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in Yahoo API proxy:", error)
    return NextResponse.json({ error: "Server error processing Yahoo API request" }, { status: 500 })
  }
}
