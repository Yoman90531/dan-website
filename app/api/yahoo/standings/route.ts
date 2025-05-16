import { NextResponse } from "next/server"
import { makeYahooApiRequest } from "@/lib/yahoo/api-utils"
import { getCachedData, setCachedData } from "@/lib/yahoo/cache"
import { processStandingsData } from "@/lib/yahoo/data-processor"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const leagueId = searchParams.get("league_id")
    const forceRefresh = searchParams.get("refresh") === "true"

    if (!leagueId) {
      return NextResponse.json({ error: "Missing league_id parameter" }, { status: 400 })
    }

    // Check cache first
    const cacheKey = `standings:${leagueId}`
    const cachedData = getCachedData(cacheKey, { forceRefresh })

    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
      })
    }

    // Fetch from Yahoo API
    const endpoint = `/league/${leagueId}/standings?format=json`
    const response = await makeYahooApiRequest(endpoint)

    if (!response.success) {
      // If token needs refreshing, return a special status
      if (response.error?.status === 401 && response.error?.details?.needsRefresh) {
        return NextResponse.json({ error: "Token needs refreshing", needsRefresh: true }, { status: 401 })
      }

      return NextResponse.json(
        { error: response.error?.message || "Failed to fetch standings" },
        { status: response.error?.status || 500 },
      )
    }

    // Process the data
    const standingsData = processStandingsData(response.data)

    // Cache the processed data
    setCachedData(cacheKey, standingsData)

    return NextResponse.json({
      success: true,
      data: standingsData,
    })
  } catch (error) {
    console.error("Error fetching standings:", error)
    return NextResponse.json({ error: "Server error fetching standings" }, { status: 500 })
  }
}
