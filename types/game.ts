export type PieceType = 'I' | 'L' | 'T' | 'T2' | 'U' | 'X' | 'N' | 'Y' | 'P' | 'F' | 'Z' | 'W' | 'V'

export type Cell = [col: number, row: number]

export type Bracket = 'newcomer' | 'intermediate' | 'advanced' | 'master'

export type GameMode = 'solo' | 'challenge'

// What the server returns when a session is started — seed is NEVER sent to client
export type SessionToken = {
  sessionId: string
  bracket: Bracket
  gameMode: GameMode
  expiresAt: string   // ISO timestamp — session is invalid after this
}

// The current piece the client is allowed to know about
export type CurrentPiece = {
  type: PieceType
  rotation: number
  col: number
  row: number
}

// Next piece preview — only the type, not the full queue
export type NextPiecePreview = {
  type: PieceType
}

export type PowerType = 'shape_swap' | 'anchor' | 'instant_clear' | 'line_lock'

export type PowerLoadout = [PowerType | null, PowerType | null, PowerType | null]

export type GameResult = {
  sessionId: string
  score: number
  bands: number
  maxTier: number
  xpEarned: number
  // Board state hash — server verifies this wasn't tampered with
  boardHash: string
}
