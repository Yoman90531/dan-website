import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check environment variables
    const clientId = process.env.YAHOO_CLIENT_ID
    const clientSecret = process.env.YAHOO_CLIENT_SECRET
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    // Return status of environment variables (don't include actual values in production)
    return NextResponse.json({
      success: true,
      environment: {
        YAHOO_CLIENT_ID: clientId ? "Set" : "Not set",
        YAHOO_CLIENT_SECRET: clientSecret ? "Set" : "Not set",
        NEXT_PUBLIC_APP_URL: appUrl ? "Set" : "Not set",
        NODE_ENV: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error("Error in test-env endpoint:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
