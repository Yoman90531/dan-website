import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Check if we have tokens in cookies
    const cookieStore = cookies()
    const accessToken = cookieStore.get("yahoo_access_token")
    const refreshToken = cookieStore.get("yahoo_refresh_token")
    const tokenExpiry = cookieStore.get("yahoo_token_expiry")

    const authenticated = !!accessToken
    const needsRefresh = authenticated && tokenExpiry ? Date.now() > Number.parseInt(tokenExpiry.value) : false

    return NextResponse.json({
      authenticated,
      needsRefresh: needsRefresh && !!refreshToken,
      expiresAt: tokenExpiry ? Number.parseInt(tokenExpiry.value) : null,
    })
  } catch (error) {
    console.error("Error checking authentication:", error)
    return NextResponse.json({ authenticated: false })
  }
}
