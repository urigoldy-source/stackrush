import type { Bracket, PieceType } from '@/types/game'

export const BRACKETS: { name: Bracket; minXp: number; maxXp: number; label: string; color: string }[] = [
  { name: 'newcomer',     minXp: 0,     maxXp: 500,   label: 'Newcomer',     color: '#aaaaaa' },
  { name: 'intermediate', minXp: 500,   maxXp: 2000,  label: 'Intermediate', color: '#66bb6a' },
  { name: 'advanced',     minXp: 2000,  maxXp: 6000,  label: 'Advanced',     color: '#f08020' },
  { name: 'master',       minXp: 6000,  maxXp: Infinity, label: 'Master',    color: '#f0c040' },
]

export const BRACKET_PIECES: Record<Bracket, PieceType[]> = {
  newcomer:     ['I', 'L', 'T', 'U', 'X', 'N'],
  intermediate: ['I', 'L', 'T', 'U', 'X', 'N', 'Y', 'P', 'F'],
  advanced:     ['I', 'L', 'T', 'U', 'X', 'N', 'Y', 'P', 'F', 'Z', 'W', 'V'],
  master:       ['I', 'L', 'T', 'T2', 'U', 'X', 'N', 'Y', 'P', 'F', 'Z', 'W', 'V'],
}

export const BRACKET_TIER_CEILING: Record<Bracket, number | null> = {
  newcomer:     3,
  intermediate: 6,
  advanced:     9,
  master:       null,
}

export function bracketFromXp(xp: number): Bracket {
  for (const b of [...BRACKETS].reverse()) {
    if (xp >= b.minXp) return b.name
  }
  return 'newcomer'
}
