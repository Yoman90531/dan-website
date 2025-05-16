"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface YahooFantasyHook {
  auth: AuthState
  login: () => Promise<void>
  logout: () => Promise<void>
  fetchLeagues: (season?: string) => Promise<any>
  fetchStandings: (leagueId: string) => Promise<any>
  fetchMatchups: (leagueId: string, week?: number) => Promise<any>
  fetchRoster: (leagueId: string, teamId: string) => Promise<any>
}

export function useYahooFantasy(): YahooFantasyHook {
  const router = useRouter()
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Function to check authentication status
  const checkAuth = async () => {
    try {
      setAuth((prev) => ({ ...prev, isLoading: true, error: null }))
      const response = await fetch("/api/yahoo/check-auth")
      const data = await response.json()

      setAuth({
        isAuthenticated: data.authenticated,
        isLoading: false,
        error: null,
      })

      // If token needs refreshing, refresh it
      if (data.authenticated && data.needsRefresh) {
        await refreshToken()
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
      setAuth({
        isAuthenticated: false,
        isLoading: false,
        error: "Failed to check authentication status",
      })
    }
  }

  // Function to initiate login
  const login = async () => {
    try {
      setAuth((prev) => ({ ...prev, isLoading: true, error: null }))
      const response = await fetch("/api/yahoo/auth")
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No authentication URL returned")
      }
    } catch (error) {
      console.error("Error during login:", error)
      setAuth((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to authenticate with Yahoo",
      }))
    }
  }

  // Function to logout
  const logout = async () => {
    try {
      setAuth((prev) => ({ ...prev, isLoading: true, error: null }))
      await fetch("/api/yahoo/logout", { method: "POST" })
      setAuth({
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
      router.push("/stats")
    } catch (error) {
      console.error("Error during logout:", error)
      setAuth((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to logout",
      }))
    }
  }

  // Function to refresh token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/yahoo/refresh-token", { method: "POST" })

      if (!response.ok) {
        if (response.status === 401) {
          // Token refresh failed due to invalid refresh token
          setAuth({
            isAuthenticated: false,
            isLoading: false,
            error: "Session expired. Please login again.",
          })
          return false
        }
        throw new Error(`Failed to refresh token: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error("Error refreshing token:", error)
      setAuth((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to refresh token",
      }))
      return false
    }
  }

  // Function to handle API responses and refresh token if needed
  const handleApiResponse = async (response: Response) => {
    if (response.status === 401) {
      const data = await response.json()
      if (data.needsRefresh) {
        const refreshed = await refreshToken()
        if (refreshed) {
          return "refresh" // Signal that the token was refreshed
        }
      }
      throw new Error("Authentication failed")
    }

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `API request failed: ${response.statusText}`)
    }

    return await response.json()
  }

  // Function to fetch leagues
  const fetchLeagues = useCallback(async (season?: string) => {
    try {
      const params = new URLSearchParams()
      if (season) params.append("season", season)

      const endpoint = `/users;use_login=1/games;game_keys=nfl/leagues?format=json`
      let response = await fetch(`/api/yahoo/proxy?endpoint=${encodeURIComponent(endpoint)}`)
      let result = await handleApiResponse(response)

      // If token was refreshed, retry the request
      if (result === "refresh") {
        response = await fetch(`/api/yahoo/proxy?endpoint=${encodeURIComponent(endpoint)}`)
        result = await handleApiResponse(response)
      }

      return result
    } catch (error) {
      console.error("Error fetching leagues:", error)
      throw error
    }
  }, [])

  // Function to fetch standings
  const fetchStandings = useCallback(async (leagueId: string) => {
    try {
      const endpoint = `/league/${leagueId}/standings?format=json`
      let response = await fetch(`/api/yahoo/proxy?endpoint=${encodeURIComponent(endpoint)}`)
      let result = await handleApiResponse(response)

      // If token was refreshed, retry the request
      if (result === "refresh") {
        response = await fetch(`/api/yahoo/proxy?endpoint=${encodeURIComponent(endpoint)}`)
        result = await handleApiResponse(response)
      }

      return result
    } catch (error) {
      console.error("Error fetching standings:", error)
      throw error
    }
  }, [])

  // Function to fetch matchups
  const fetchMatchups = useCallback(async (leagueId: string, week?: number) => {
    try {
      const weekParam = week ? `;week=${week}` : ""
      const endpoint = `/league/${leagueId}/matchups${weekParam}?format=json`
      let response = await fetch(`/api/yahoo/proxy?endpoint=${encodeURIComponent(endpoint)}`)
      let result = await handleApiResponse(response)

      // If token was refreshed, retry the request
      if (result === "refresh") {
        response = await fetch(`/api/yahoo/proxy?endpoint=${encodeURIComponent(endpoint)}`)
        result = await handleApiResponse(response)
      }

      return result
    } catch (error) {
      console.error("Error fetching matchups:", error)
      throw error
    }
  }, [])

  // Function to fetch roster
  const fetchRoster = useCallback(async (leagueId: string, teamId: string) => {
    try {
      const endpoint = `/team/${leagueId}.t.${teamId}/roster?format=json`
      let response = await fetch(`/api/yahoo/proxy?endpoint=${encodeURIComponent(endpoint)}`)
      let result = await handleApiResponse(response)

      // If token was refreshed, retry the request
      if (result === "refresh") {
        response = await fetch(`/api/yahoo/proxy?endpoint=${encodeURIComponent(endpoint)}`)
        result = await handleApiResponse(response)
      }

      return result
    } catch (error) {
      console.error("Error fetching roster:", error)
      throw error
    }
  }, [])

  return {
    auth,
    login,
    logout,
    fetchLeagues,
    fetchStandings,
    fetchMatchups,
    fetchRoster,
  }
}
