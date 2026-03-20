// Game registry — add new games here.
// Each entry describes a game; the actual engine is lazy-loaded per route.

export type GameMeta = {
  slug: string
  name: string
  description: string
  minBracket: 'newcomer' | 'intermediate' | 'advanced' | 'master'
  sessionDurationSeconds: number
}

export const GAMES: Record<string, GameMeta> = {
  'stack-rush': {
    slug: 'stack-rush',
    name: 'Stack Rush',
    description: 'Competitive pentomino skill game. 13 pieces, 5 minutes, same seed for all.',
    minBracket: 'newcomer',
    sessionDurationSeconds: 300,
  },
  // Add future games here:
  // 'block-blitz': { ... }
}

export function getGame(slug: string): GameMeta | null {
  return GAMES[slug] ?? null
}
