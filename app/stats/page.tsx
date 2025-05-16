"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  BarChart3,
  Trophy,
  Users,
  Calendar,
  TrendingUp,
  History,
  Zap,
  AlertCircle,
  RefreshCw,
  LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useYahooFantasy } from "@/hooks/use-yahoo-fantasy"

// Mock data for Fantasy Football (used as fallback)
const MOCK_DATA = {
  leagues: [
    {
      league_id: "32143",
      name: "Fantasy Football League #32143",
      season: "2023",
      num_teams: 12,
      current_week: 17,
    },
  ],
  standings: [
    {
      team_id: "1",
      name: "Touchdown Titans",
      rank: 1,
      wins: 12,
      losses: 2,
      ties: 0,
      percentage: 0.857,
      points_for: 1687.5,
      points_against: 1432.8,
    },
    {
      team_id: "2",
      name: "Gridiron Giants",
      rank: 2,
      wins: 11,
      losses: 3,
      ties: 0,
      percentage: 0.786,
      points_for: 1645.2,
      points_against: 1489.6,
    },
    {
      team_id: "3",
      name: "Field Generals",
      rank: 3,
      wins: 9,
      losses: 5,
      ties: 0,
      percentage: 0.643,
      points_for: 1598.7,
      points_against: 1512.3,
    },
    {
      team_id: "4",
      name: "Pigskin Warriors",
      rank: 4,
      wins: 8,
      losses: 6,
      ties: 0,
      percentage: 0.571,
      points_for: 1567.4,
      points_against: 1534.9,
    },
    {
      team_id: "5",
      name: "Blitz Brigade",
      rank: 5,
      wins: 7,
      losses: 7,
      ties: 0,
      percentage: 0.5,
      points_for: 1523.8,
      points_against: 1545.2,
    },
  ],
  matchups: [
    {
      week: 16,
      team1: { name: "Touchdown Titans", score: 142.8 },
      team2: { name: "Gridiron Giants", score: 128.5 },
      winner: "Touchdown Titans",
    },
    {
      week: 16,
      team1: { name: "Field Generals", score: 135.2 },
      team2: { name: "Pigskin Warriors", score: 122.7 },
      winner: "Field Generals",
    },
    {
      week: 16,
      team1: { name: "Blitz Brigade", score: 118.9 },
      team2: { name: "Turf Terminators", score: 124.3 },
      winner: "Turf Terminators",
    },
  ],
  champions: [
    { season: "2023", team: "Touchdown Titans", manager: "John Smith" },
    { season: "2022", team: "Field Generals", manager: "Mike Williams" },
    { season: "2021", team: "Gridiron Giants", manager: "Sarah Johnson" },
  ],
}

export default function StatsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { auth, login, logout } = useYahooFantasy()

  const [activeTab, setActiveTab] = useState("overview")
  const [selectedSeason, setSelectedSeason] = useState("2023")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [leagues, setLeagues] = useState(MOCK_DATA.leagues)
  const [standings, setStandings] = useState(MOCK_DATA.standings)
  const [matchups, setMatchups] = useState(MOCK_DATA.matchups)
  const [champions, setChampions] = useState(MOCK_DATA.champions)

  // Check for auth success or error messages in URL
  useEffect(() => {
    const authSuccess = searchParams.get("auth") === "success"
    const authError = searchParams.get("error")

    if (authSuccess) {
      setStatusMessage("Authentication successful!")
    }

    if (authError) {
      setError(decodeURIComponent(authError))
    }
  }, [searchParams])

  const handleBack = () => {
    router.push("/")
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setStatusMessage("Refreshing data...")

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
      setStatusMessage(null)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a8a] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4 text-white hover:bg-blue-800">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">Fantasy Football Analytics</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger className="w-[120px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select Season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023 Season</SelectItem>
                <SelectItem value="2022">2022 Season</SelectItem>
                <SelectItem value="2021">2021 Season</SelectItem>
                <SelectItem value="2020">2020 Season</SelectItem>
                <SelectItem value="2019">2019 Season</SelectItem>
                <SelectItem value="2018">2018 Season</SelectItem>
              </SelectContent>
            </Select>
            {auth.isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-blue-800"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-blue-800"
                onClick={login}
                disabled={auth.isLoading}
              >
                <LogIn className="h-4 w-4 mr-1" />
                Connect Yahoo
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {statusMessage && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
            <AlertDescription className="text-blue-800">{statusMessage}</AlertDescription>
          </Alert>
        )}

        {!auth.isAuthenticated && !auth.isLoading && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
            <AlertDescription className="text-yellow-800">
              Connect your Yahoo Fantasy account to see your real data. Currently showing mock data.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">League Dashboard</h2>
              <p className="text-sm text-gray-500">
                {leagues[0].name} - {selectedSeason} Season
              </p>
            </div>
            {auth.isAuthenticated && (
              <Button variant="outline" size="sm" onClick={logout}>
                Disconnect Yahoo
              </Button>
            )}
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 mb-6">
              <TabsTrigger value="overview" className="text-sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="historical" className="text-sm">
                <History className="h-4 w-4 mr-2" />
                Historical
              </TabsTrigger>
              <TabsTrigger value="teams" className="text-sm">
                <Users className="h-4 w-4 mr-2" />
                Teams
              </TabsTrigger>
              <TabsTrigger value="players" className="text-sm">
                <Zap className="h-4 w-4 mr-2" />
                Players
              </TabsTrigger>
              <TabsTrigger value="matchups" className="text-sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Matchups
              </TabsTrigger>
              <TabsTrigger value="playoffs" className="text-sm">
                <Trophy className="h-4 w-4 mr-2" />
                Playoffs
              </TabsTrigger>
              <TabsTrigger value="draft" className="text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                Draft
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="overview" className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">League Champion</CardTitle>
                        <CardDescription>{selectedSeason} Season</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                          <div>
                            <div className="text-2xl font-bold">
                              {champions.find((c) => c.season === selectedSeason)?.team || "Not available"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {champions.find((c) => c.season === selectedSeason)?.manager || ""}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                        <CardDescription>Single Week ({selectedSeason})</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">142.8 pts</div>
                        <div className="text-sm text-gray-500">Touchdown Titans - Week 16</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Most Championships</CardTitle>
                        <CardDescription>All-Time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">2 Titles</div>
                        <div className="text-sm text-gray-500">Touchdown Titans (2020, 2023)</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Longest Win Streak</CardTitle>
                        <CardDescription>All-Time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">9 Games</div>
                        <div className="text-sm text-gray-500">Touchdown Titans (2020)</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* League Standings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>League Standings</CardTitle>
                      <CardDescription>Current standings for {selectedSeason} season</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left font-medium text-gray-500 pb-3">Rank</th>
                              <th className="text-left font-medium text-gray-500 pb-3">Team</th>
                              <th className="text-center font-medium text-gray-500 pb-3">W-L-T</th>
                              <th className="text-center font-medium text-gray-500 pb-3">Win %</th>
                              <th className="text-right font-medium text-gray-500 pb-3">PF</th>
                              <th className="text-right font-medium text-gray-500 pb-3">PA</th>
                            </tr>
                          </thead>
                          <tbody>
                            {standings.map((team) => (
                              <tr key={team.team_id} className="border-b hover:bg-gray-50">
                                <td className="py-3">{team.rank}</td>
                                <td className="py-3 font-medium">{team.name}</td>
                                <td className="py-3 text-center">{`${team.wins}-${team.losses}-${team.ties}`}</td>
                                <td className="py-3 text-center">{(team.percentage * 100).toFixed(1)}%</td>
                                <td className="py-3 text-right">{team.points_for.toFixed(1)}</td>
                                <td className="py-3 text-right">{team.points_against.toFixed(1)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Matchups */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Matchups</CardTitle>
                      <CardDescription>Latest game results</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {matchups.map((matchup, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-500">Week {matchup.week}</span>
                              <span className="text-sm font-medium">Final</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div
                                  className={`w-1 h-12 rounded-full ${matchup.winner === matchup.team1.name ? "bg-green-500" : "bg-gray-200"} mr-3`}
                                ></div>
                                <div>
                                  <div className="font-medium">{matchup.team1.name}</div>
                                </div>
                              </div>
                              <div className="text-xl font-bold">{matchup.team1.score.toFixed(1)}</div>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <div className="flex items-center">
                                <div
                                  className={`w-1 h-12 rounded-full ${matchup.winner === matchup.team2.name ? "bg-green-500" : "bg-gray-200"} mr-3`}
                                ></div>
                                <div>
                                  <div className="font-medium">{matchup.team2.name}</div>
                                </div>
                              </div>
                              <div className="text-xl font-bold">{matchup.team2.score.toFixed(1)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Placeholder content for other tabs */}
            <TabsContent value="historical">
              <div className="py-20 text-center text-gray-500">
                <History className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-medium mb-2">Historical Data</h3>
                <p>Historical data will be available soon</p>
              </div>
            </TabsContent>

            <TabsContent value="teams">
              <div className="py-20 text-center text-gray-500">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-medium mb-2">Team Analysis</h3>
                <p>Team analysis will be available soon</p>
              </div>
            </TabsContent>

            <TabsContent value="players">
              <div className="py-20 text-center text-gray-500">
                <Zap className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-medium mb-2">Player Statistics</h3>
                <p>Player statistics will be available soon</p>
              </div>
            </TabsContent>

            <TabsContent value="matchups">
              <div className="py-20 text-center text-gray-500">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-medium mb-2">Matchup Analysis</h3>
                <p>Detailed matchup analysis will be available soon</p>
              </div>
            </TabsContent>

            <TabsContent value="playoffs">
              <div className="py-20 text-center text-gray-500">
                <Trophy className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-medium mb-2">Playoff Performance</h3>
                <p>Playoff statistics will be available soon</p>
              </div>
            </TabsContent>

            <TabsContent value="draft">
              <div className="py-20 text-center text-gray-500">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-medium mb-2">Draft Analysis</h3>
                <p>Draft history and performance will be available soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* League Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">
                {auth.isAuthenticated
                  ? "Connected to Yahoo Fantasy. Viewing your fantasy football data."
                  : "Viewing mock data for Fantasy Football League #32143. Connect your Yahoo account to see your real data."}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">Fantasy Football Analytics Dashboard</p>
        </div>
      </footer>
    </div>
  )
}
