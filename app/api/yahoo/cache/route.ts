import { NextResponse } from "next/server"
import { clearCache, getCacheStats } from "@/lib/yahoo/cache"
import type { NextRequest } from "next/server"

export async function GET() {
  try {
    const stats = getCacheStats()
    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error getting cache stats:", error)
    return NextResponse.json({ error: "Server error getting cache stats" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const prefix = searchParams.get("prefix")

    clearCache(prefix || undefined)

    return NextResponse.json({
      success: true,
      message: prefix ? `Cache cleared for prefix: ${prefix}` : "All cache cleared",
    })
  } catch (error) {
    console.error("Error clearing cache:", error)
    return NextResponse.json({ error: "Server error clearing cache" }, { status: 500 })
  }
}
