import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Simple middleware that doesn't block any routes
  // Just pass through all requests
  return NextResponse.next()
}
