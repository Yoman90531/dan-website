import { NextResponse } from "next/server"
import { makeYahooApiRequest } from "@/lib/yahoo/api-utils"
import { getCachedData, setCachedData } from "@/lib/yahoo/cache"
import { processLeagueData } from "@/lib/yahoo/data-processor"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const season = searchParams.get("season") || new Date().getFullYear().toString()
    const forceRefresh = searchParams.get("refresh") === "true"

    // Check cache first
    const cacheKey = `leagues:${season}`
    const cachedData = getCachedData(cacheKey, { forceRefresh })

    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
      })
    }

    // Fetch from Yahoo API
    const endpoint = `/users;use_login=1/games;game_keys=nfl/leagues?format=json`
    const response = await makeYahooApiRequest(endpoint)

    if (!response.success) {
      // If token needs refreshing, return a special status
      if (response.error?.status === 401 && response.error?.details?.needsRefresh) {
        return NextResponse.json({ error: "Token needs refreshing", needsRefresh: true }, { status: 401 })
      }

      return NextResponse.json(
        { error: response.error?.message || "Failed to fetch leagues" },
        { status: response.error?.status || 500 },
      )
    }

    // Process the data
    const leagues = response.data?.fantasy_content?.users?.[0]?.user?.[1]?.games?.[0]?.game?.[1]?.leagues || []
    const processedData = leagues.map((league: any) => processLeagueData(league))

    // Cache the processed data
    setCachedData(cacheKey, processedData)

    return NextResponse.json({
      success: true,
      data: processedData,
    })
  } catch (error) {
    console.error("Error fetching leagues:", error)
    return NextResponse.json({ error: "Server error fetching leagues" }, { status: 500 })
  }
}
