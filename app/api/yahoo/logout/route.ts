import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Clear all Yahoo-related cookies
    cookies().delete("yahoo_access_token")
    cookies().delete("yahoo_refresh_token")
    cookies().delete("yahoo_token_expiry")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error during logout:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}
