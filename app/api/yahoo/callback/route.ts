import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Get code and error from query parameters
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    // Handle error from Yahoo
    if (error) {
      console.error("OAuth error:", error)
      return NextResponse.redirect(new URL(`/stats?error=${encodeURIComponent(error)}`, request.url))
    }

    // Check if code exists
    if (!code) {
      return NextResponse.redirect(new URL("/stats?error=No+authorization+code+received", request.url))
    }

    // Get environment variables
    const clientId = process.env.YAHOO_CLIENT_ID
    const clientSecret = process.env.YAHOO_CLIENT_SECRET
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!clientId || !clientSecret || !appUrl) {
      console.error("Missing environment variables:", {
        clientIdExists: !!clientId,
        clientSecretExists: !!clientSecret,
        appUrlExists: !!appUrl,
      })
      return NextResponse.redirect(new URL("/stats?error=Missing+required+environment+variables", request.url))
    }

    const redirectUri = `${appUrl}/api/yahoo/callback`

    // Exchange code for tokens
    const tokenResponse = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    })

    // Handle token exchange error
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Token exchange failed:", errorData)
      return NextResponse.redirect(
        new URL(`/stats?error=${encodeURIComponent("Failed to exchange authorization code")}`, request.url),
      )
    }

    // Parse token data
    const tokenData = await tokenResponse.json()

    // Store tokens in HTTP-only cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    }

    // Set cookies
    cookies().set("yahoo_access_token", tokenData.access_token, {
      ...cookieOptions,
      maxAge: tokenData.expires_in,
    })

    cookies().set("yahoo_refresh_token", tokenData.refresh_token, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    cookies().set("yahoo_token_expiry", (Date.now() + tokenData.expires_in * 1000).toString(), {
      ...cookieOptions,
      maxAge: tokenData.expires_in,
    })

    // Redirect to stats page with success
    return NextResponse.redirect(new URL("/stats?auth=success", request.url))
  } catch (error) {
    console.error("Error in callback:", error)
    const errorMessage = encodeURIComponent("Failed to authenticate with Yahoo")
    return NextResponse.redirect(new URL(`/stats?error=${errorMessage}`, request.url))
  }
}
