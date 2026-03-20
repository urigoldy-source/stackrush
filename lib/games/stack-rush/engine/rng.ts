// Mulberry32 — fast, deterministic, seedable PRNG
// This module runs SERVER-SIDE ONLY. Never import from client components.

import type { Bracket, PieceType } from '@/types/game'
import { BRACKET_PIECES } from './brackets'

export function mulberry32(seed: number) {
  let s = seed
  return function next(): number {
    s |= 0
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Advance the RNG to a specific index without storing intermediate state.
// Used to vend piece N without replaying the full history.
export function getPieceAtIndex(seed: number, index: number, bracket: Bracket): PieceType {
  const rng = mulberry32(seed)
  const pieces = BRACKET_PIECES[bracket]

  // Advance RNG to the requested index
  for (let i = 0; i < index; i++) rng()

  return pieces[Math.floor(rng() * pieces.length)]
}
