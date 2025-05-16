import { cookies } from "next/headers"
import type { YahooTokenData, ApiResponse } from "./types"

// Base URL for Yahoo Fantasy API
const YAHOO_API_BASE_URL = "https://fantasysports.yahooapis.com/fantasy/v2"

// Function to check if token is expired or about to expire (within 5 minutes)
export function isTokenExpired(expiryTime: number): boolean {
  const currentTime = Date.now()
  const expiryBuffer = 5 * 60 * 1000 // 5 minutes in milliseconds
  return currentTime + expiryBuffer >= expiryTime
}

// Function to get auth tokens from cookies
export function getAuthTokens() {
  const cookieStore = cookies()
  const accessToken = cookieStore.get("yahoo_access_token")?.value
  const refreshToken = cookieStore.get("yahoo_refresh_token")?.value
  const tokenExpiry = cookieStore.get("yahoo_token_expiry")?.value
    ? Number.parseInt(cookieStore.get("yahoo_token_expiry")?.value || "0")
    : 0

  return {
    accessToken,
    refreshToken,
    tokenExpiry,
    isAuthenticated: !!accessToken && !!refreshToken,
    needsRefresh: !!refreshToken && (!accessToken || isTokenExpired(tokenExpiry)),
  }
}

// Function to store auth tokens in cookies
export function storeAuthTokens(tokenData: YahooTokenData) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  }

  const expiryTime = Date.now() + tokenData.expires_in * 1000

  cookies().set("yahoo_access_token", tokenData.access_token, {
    ...cookieOptions,
    maxAge: tokenData.expires_in,
  })

  cookies().set("yahoo_refresh_token", tokenData.refresh_token, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  cookies().set("yahoo_token_expiry", expiryTime.toString(), {
    ...cookieOptions,
    maxAge: tokenData.expires_in,
  })

  return expiryTime
}

// Function to clear auth tokens from cookies
export function clearAuthTokens() {
  cookies().delete("yahoo_access_token")
  cookies().delete("yahoo_refresh_token")
  cookies().delete("yahoo_token_expiry")
}

// Function to make authenticated requests to Yahoo API
export async function makeYahooApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const { accessToken, needsRefresh, refreshToken } = getAuthTokens()

    if (!accessToken) {
      return {
        success: false,
        error: {
          message: "Not authenticated",
          status: 401,
        },
      }
    }

    if (needsRefresh && refreshToken) {
      // Token needs refreshing, but we'll handle that in the middleware
      return {
        success: false,
        error: {
          message: "Token needs refreshing",
          status: 401,
          details: { needsRefresh: true },
        },
      }
    }

    // Construct the full Yahoo Fantasy API URL
    const url = endpoint.startsWith("http") ? endpoint : `${YAHOO_API_BASE_URL}${endpoint}`

    // Make the request to Yahoo's API
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Yahoo API error (${response.status}):`, errorText)

      // If unauthorized, clear tokens
      if (response.status === 401) {
        clearAuthTokens()
      }

      return {
        success: false,
        error: {
          message: "Yahoo API request failed",
          status: response.status,
          details: errorText,
        },
      }
    }

    // Parse and return the response
    const contentType = response.headers.get("content-type")
    let data: T

    if (contentType?.includes("application/json")) {
      data = await response.json()
    } else {
      // For XML responses, we'll need to parse them
      const text = await response.text()
      data = parseYahooResponse(text) as T
    }

    return {
      success: true,
      data,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error("Error in Yahoo API request:", error)
    return {
      success: false,
      error: {
        message: "Server error processing Yahoo API request",
        details: error instanceof Error ? error.message : String(error),
      },
    }
  }
}

// Function to parse Yahoo XML responses
// This is a placeholder - you would need to implement proper XML parsing
function parseYahooResponse(xmlText: string): any {
  // In a real implementation, you would use a library like xml2js
  // For now, we'll just return a placeholder
  console.log("Parsing Yahoo XML response:", xmlText.substring(0, 100) + "...")

  // This is where you would parse the XML and convert it to a JavaScript object
  // For example:
  // const parser = new DOMParser();
  // const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  // Then extract the data you need from xmlDoc

  return { parsedData: "XML parsing not implemented" }
}

// Function to generate OAuth authorization URL
export function generateAuthUrl(): string {
  const clientId = process.env.YAHOO_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/yahoo/callback`

  if (!clientId || !redirectUri) {
    throw new Error("Missing required environment variables for Yahoo OAuth")
  }

  const authUrl = new URL("https://api.login.yahoo.com/oauth2/request_auth")
  authUrl.searchParams.append("client_id", clientId)
  authUrl.searchParams.append("redirect_uri", redirectUri)
  authUrl.searchParams.append("response_type", "code")
  authUrl.searchParams.append("language", "en-us")

  return authUrl.toString()
}
