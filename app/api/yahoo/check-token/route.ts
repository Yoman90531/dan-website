import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const accessToken = cookies().get("yahoo_access_token")?.value
  const tokenExpiry = cookies().get("yahoo_token_expiry")?.value
  const refreshToken = cookies().get("yahoo_refresh_token")?.value

  if (!accessToken || !tokenExpiry) {
    return NextResponse.json({
      valid: false,
      needsRefresh: !!refreshToken,
      authenticated: false,
    })
  }

  const expiryTime = Number.parseInt(tokenExpiry)
  const currentTime = Date.now()

  // Token is considered needing refresh if it expires in less than 5 minutes
  const needsRefresh = expiryTime - currentTime < 5 * 60 * 1000

  return NextResponse.json({
    valid: expiryTime > currentTime,
    needsRefresh,
    authenticated: true,
    expiresAt: expiryTime,
  })
}
