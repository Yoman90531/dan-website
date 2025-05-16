// Types for Yahoo Fantasy API responses and our internal data structures

export interface YahooTokenData {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export interface TokenStatus {
  valid: boolean
  needsRefresh: boolean
  authenticated: boolean
  expiresAt?: number
}

export interface LeagueData {
  league_id: string
  name: string
  season: string
  num_teams: number
  current_week: number
  start_week: number
  end_week: number
  start_date: string
  end_date: string
  game_code: string
  url: string
}

export interface TeamData {
  team_id: string
  name: string
  manager_name: string
  team_logo?: string
  team_url?: string
  waiver_priority?: number
  faab_balance?: number
  number_of_moves?: number
  number_of_trades?: number
  clinched_playoffs?: boolean
  wins: number
  losses: number
  ties: number
  percentage: number
  points_for: number
  points_against: number
  rank: number
  playoff_seed?: number
}

export interface StandingsData {
  league: LeagueData
  teams: TeamData[]
}

export interface PlayerData {
  player_id: string
  name: string
  editorial_team_abbr: string
  display_position: string
  position_type: string
  status?: string
  injury_note?: string
  eligible_positions: string[]
  selected_position?: string
  is_starting?: boolean
  image_url?: string
  bye_week?: number
  uniform_number?: number
  percent_owned?: number
  percent_started?: number
  fantasy_points?: number
}

export interface RosterData {
  team: TeamData
  players: PlayerData[]
}

export interface MatchupTeam {
  team_id: string
  name: string
  team_logo?: string
  manager_name: string
  points: number
  projected_points?: number
  win_probability?: number
}

export interface MatchupData {
  week: number
  week_start: string
  week_end: string
  status: "complete" | "inprogress" | "upcoming"
  is_playoffs: boolean
  is_consolation: boolean
  is_matchup_recap_available: boolean
  team1: MatchupTeam
  team2: MatchupTeam
  winner_team_id?: string
}

export interface LeagueMatchupsData {
  league: LeagueData
  matchups: MatchupData[]
}

export interface ChampionData {
  season: string
  league_id: string
  champion: {
    team_id: string
    name: string
    manager_name: string
  }
}

export interface LeagueHistoryData {
  league_id: string
  season: string
  name: string
  num_teams: number
  champions: ChampionData[]
}

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  forceRefresh?: boolean
}

export interface ApiError {
  message: string
  status?: number
  details?: any
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  cached?: boolean
  timestamp?: number
}
