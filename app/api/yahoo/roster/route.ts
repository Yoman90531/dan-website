import { NextResponse } from "next/server"
import { makeYahooApiRequest } from "@/lib/yahoo/api-utils"
import { getCachedData, setCachedData } from "@/lib/yahoo/cache"
import { processRosterData } from "@/lib/yahoo/data-processor"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const leagueId = searchParams.get("league_id")
    const teamId = searchParams.get("team_id")
    const forceRefresh = searchParams.get("refresh") === "true"

    if (!leagueId || !teamId) {
      return NextResponse.json({ error: "Missing league_id or team_id parameter" }, { status: 400 })
    }

    // Check cache first
    const cacheKey = `roster:${leagueId}:${teamId}`
    const cachedData = getCachedData(cacheKey, { forceRefresh })

    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
      })
    }

    // Fetch from Yahoo API
    const endpoint = `/team/${leagueId}.t.${teamId}/roster?format=json`
    const response = await makeYahooApiRequest(endpoint)

    if (!response.success) {
      // If token needs refreshing, return a special status
      if (response.error?.status === 401 && response.error?.details?.needsRefresh) {
        return NextResponse.json({ error: "Token needs refreshing", needsRefresh: true }, { status: 401 })
      }

      return NextResponse.json(
        { error: response.error?.message || "Failed to fetch roster" },
        { status: response.error?.status || 500 },
      )
    }

    // Process the data
    const rosterData = processRosterData(response.data)

    // Cache the processed data
    setCachedData(cacheKey, rosterData)

    return NextResponse.json({
      success: true,
      data: rosterData,
    })
  } catch (error) {
    console.error("Error fetching roster:", error)
    return NextResponse.json({ error: "Server error fetching roster" }, { status: 500 })
  }
}
