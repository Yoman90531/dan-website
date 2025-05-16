// Yahoo Fantasy API integration

// Function to generate the OAuth authorization URL
export function getAuthUrl(): string {
  const clientId = process.env.YAHOO_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/yahoo/callback`

  if (!clientId || !redirectUri) {
    throw new Error("Missing required environment variables for Yahoo OAuth")
  }

  const authUrl = new URL("https://api.login.yahoo.com/oauth2/request_auth")
  authUrl.searchParams.append("client_id", clientId)
  authUrl.searchParams.append("redirect_uri", redirectUri)
  authUrl.searchParams.append("response_type", "code")
  authUrl.searchParams.append("language", "en-us")

  return authUrl.toString()
}

// Function to check if the user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    const response = await fetch("/api/yahoo/check-auth", {
      method: "GET",
      credentials: "include",
    })
    const data = await response.json()
    return data.authenticated
  } catch (error) {
    console.error("Error checking authentication status:", error)
    return false
  }
}

// Function to make an authenticated request to the Yahoo Fantasy API
export async function makeApiRequest(endpoint: string): Promise<any> {
  try {
    // First, check if token needs refreshing
    const tokenResponse = await fetch("/api/yahoo/check-token", {
      method: "GET",
      credentials: "include",
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to validate token")
    }

    const tokenData = await tokenResponse.json()

    // If token needs refreshing, refresh it
    if (tokenData.needsRefresh) {
      const refreshResponse = await fetch("/api/yahoo/refresh-token", {
        method: "POST",
        credentials: "include",
      })

      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh token")
      }
    }

    // Now make the actual API request
    const apiResponse = await fetch(`/api/yahoo/proxy?endpoint=${encodeURIComponent(endpoint)}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!apiResponse.ok) {
      throw new Error(`API request failed: ${apiResponse.statusText}`)
    }

    return await apiResponse.json()
  } catch (error) {
    console.error("Error making API request:", error)
    throw error
  }
}

// Function to get user's leagues
export async function getUserLeagues(season = "2023"): Promise<any> {
  return makeApiRequest(`/users;use_login=1/games;game_keys=nfl/leagues?format=json`)
}

// Function to get specific league info
export async function getLeagueInfo(leagueId: string): Promise<any> {
  return makeApiRequest(`/league/${leagueId}?format=json`)
}

// Function to get league standings
export async function getLeagueStandings(leagueId: string): Promise<any> {
  return makeApiRequest(`/league/${leagueId}/standings?format=json`)
}

// Function to get teams in a league
export async function getLeagueTeams(leagueId: string): Promise<any> {
  return makeApiRequest(`/league/${leagueId}/teams?format=json`)
}

// Function to get a team's roster
export async function getTeamRoster(leagueId: string, teamId: string): Promise<any> {
  return makeApiRequest(`/team/${leagueId}.t.${teamId}/roster?format=json`)
}

// Function to get league matchups
export async function getLeagueMatchups(leagueId: string, week?: number): Promise<any> {
  const weekParam = week ? `;week=${week}` : ""
  return makeApiRequest(`/league/${leagueId}/matchups${weekParam}?format=json`)
}

// Function to get historical league data
export async function getHistoricalLeagueData(leagueId: string, season: string): Promise<any> {
  // For historical data, we need to modify the league ID to include the season
  // Format is typically: {game_key}.l.{league_id}
  const gameKey = `nfl.${season}`
  const formattedLeagueId = `${gameKey}.l.${leagueId.split(".").pop()}`

  return makeApiRequest(`/league/${formattedLeagueId}/standings?format=json`)
}

// Function to get league champions
export async function getLeagueChampions(leagueId: string): Promise<any> {
  return makeApiRequest(`/league/${leagueId}/settings?format=json`)
}
