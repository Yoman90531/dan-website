import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Get refresh token from cookies
    const refreshToken = cookies().get("yahoo_refresh_token")?.value

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token available" }, { status: 401 })
    }

    // Get environment variables
    const clientId = process.env.YAHOO_CLIENT_ID
    const clientSecret = process.env.YAHOO_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Missing required environment variables" }, { status: 500 })
    }

    // Exchange refresh token for new access token
    const tokenResponse = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    })

    // Handle token refresh error
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Token refresh failed:", errorData)

      // Clear invalid tokens
      cookies().delete("yahoo_access_token")
      cookies().delete("yahoo_refresh_token")
      cookies().delete("yahoo_token_expiry")

      return NextResponse.json({ error: "Failed to refresh token" }, { status: 401 })
    }

    // Parse token data
    const tokenData = await tokenResponse.json()

    // Store new tokens in cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    }

    cookies().set("yahoo_access_token", tokenData.access_token, {
      ...cookieOptions,
      maxAge: tokenData.expires_in,
    })

    cookies().set("yahoo_refresh_token", tokenData.refresh_token, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    const expiryTime = Date.now() + tokenData.expires_in * 1000
    cookies().set("yahoo_token_expiry", expiryTime.toString(), {
      ...cookieOptions,
      maxAge: tokenData.expires_in,
    })

    return NextResponse.json({
      success: true,
      expires_in: tokenData.expires_in,
      expires_at: expiryTime,
    })
  } catch (error) {
    console.error("Error refreshing token:", error)
    return NextResponse.json({ error: "Server error during token refresh" }, { status: 500 })
  }
}
