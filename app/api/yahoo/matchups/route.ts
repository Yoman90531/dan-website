import { NextResponse } from "next/server"
import { makeYahooApiRequest } from "@/lib/yahoo/api-utils"
import { getCachedData, setCachedData } from "@/lib/yahoo/cache"
import { processLeagueMatchupsData } from "@/lib/yahoo/data-processor"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const leagueId = searchParams.get("league_id")
    const week = searchParams.get("week")
    const forceRefresh = searchParams.get("refresh") === "true"

    if (!leagueId) {
      return NextResponse.json({ error: "Missing league_id parameter" }, { status: 400 })
    }

    // Check cache first
    const cacheKey = `matchups:${leagueId}:${week || "all"}`
    const cachedData = getCachedData(cacheKey, { forceRefresh })

    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
      })
    }

    // Fetch from Yahoo API
    const weekParam = week ? `;week=${week}` : ""
    const endpoint = `/league/${leagueId}/matchups${weekParam}?format=json`
    const response = await makeYahooApiRequest(endpoint)

    if (!response.success) {
      // If token needs refreshing, return a special status
      if (response.error?.status === 401 && response.error?.details?.needsRefresh) {
        return NextResponse.json({ error: "Token needs refreshing", needsRefresh: true }, { status: 401 })
      }

      return NextResponse.json(
        { error: response.error?.message || "Failed to fetch matchups" },
        { status: response.error?.status || 500 },
      )
    }

    // Process the data
    const matchupsData = processLeagueMatchupsData(response.data)

    // Cache the processed data
    setCachedData(cacheKey, matchupsData)

    return NextResponse.json({
      success: true,
      data: matchupsData,
    })
  } catch (error) {
    console.error("Error fetching matchups:", error)
    return NextResponse.json({ error: "Server error fetching matchups" }, { status: 500 })
  }
}
