// Auto-generate this from Supabase CLI: `npx supabase gen types typescript --project-id <id>`
// This is a manual stub until then.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          xp: number
          trophies: number
          sessions: number
          bracket: string
          platform: string | null
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          xp?: number
          trophies?: number
          sessions?: number
          bracket?: string
          platform?: string | null
          updated_at?: string
        }
        Update: {
          username?: string | null
          xp?: number
          trophies?: number
          sessions?: number
          bracket?: string
          platform?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string | null
          seed: number
          bracket: string
          mode: string
          match_id: string | null
          piece_index: number
          completed: boolean
          expires_at: string
          created_at: string
        }
        Insert: {
          id: string
          user_id?: string | null
          seed: number
          bracket: string
          mode: string
          match_id?: string | null
          piece_index?: number
          expires_at: string
          created_at?: string
        }
        Update: {
          piece_index?: number
          completed?: boolean
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          id: string
          user_id: string
          username: string
          score: number
          bands: number
          tier: number
          seed: number
          bracket: string
          created_at: string
        }
        Insert: {
          user_id: string
          username: string
          score: number
          bands: number
          tier: number
          seed: number
          bracket: string
        }
        Update: {
          score?: number
          bands?: number
          tier?: number
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          short_code: string
          challenger_id: string
          challenger_username: string
          opponent_id: string | null
          opponent_username: string | null
          seed: number
          status: 'pending_opponent' | 'in_progress' | 'completed'
          challenger_score: number | null
          opponent_score: number | null
          winner_id: string | null
          challenger_loadout: string[] | null
          anchor_cell: number | null
          created_at: string
        }
        Insert: {
          short_code: string
          challenger_id: string
          challenger_username: string
          opponent_id?: string | null
          opponent_username?: string | null
          seed: number
          status?: 'pending_opponent' | 'in_progress' | 'completed'
          challenger_score?: number | null
          opponent_score?: number | null
          winner_id?: string | null
          challenger_loadout?: string[] | null
          anchor_cell?: number | null
        }
        Update: {
          opponent_id?: string | null
          opponent_username?: string | null
          status?: 'pending_opponent' | 'in_progress' | 'completed'
          challenger_score?: number | null
          opponent_score?: number | null
          winner_id?: string | null
          challenger_loadout?: string[] | null
          anchor_cell?: number | null
        }
        Relationships: []
      }
      tokens: {
        Row: {
          id: string
          user_id: string
          balance: number
          updated_at: string
        }
        Insert: {
          user_id: string
          balance: number
        }
        Update: {
          balance?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
