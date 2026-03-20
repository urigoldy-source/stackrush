// Piece shape definitions — safe to use on client.
// Contains only geometry, not the sequence or seed.

import type { Cell, PieceType } from '@/types/game'

export const PIECE_COLORS: Record<PieceType, string> = {
  I:  '#4fc3f7',
  L:  '#ff9800',
  T:  '#ab47bc',
  T2: '#00bcd4',
  U:  '#26a69a',
  X:  '#ef5350',
  N:  '#66bb6a',
  Y:  '#ffca28',
  P:  '#ec407a',
  F:  '#7e57c2',
  Z:  '#29b6f6',
  W:  '#ff7043',
  V:  '#26c6da',
}

// Canonical orientations (col, row)
const CANONICAL: Record<PieceType, Cell[]> = {
  I:  [[0,0],[1,0],[2,0],[3,0],[4,0]],
  L:  [[0,0],[0,1],[0,2],[0,3],[1,3]],
  T:  [[0,1],[1,0],[1,1],[1,2],[1,3]],
  T2: [[0,1],[1,1],[2,0],[2,1],[2,2]],
  U:  [[0,0],[0,1],[1,1],[2,1],[2,0]],
  X:  [[0,1],[1,0],[1,1]],
  N:  [[0,0],[0,1],[1,1],[1,2],[1,3]],
  Y:  [[0,2],[1,0],[1,1],[1,2],[1,3]],
  P:  [[0,0],[1,0],[0,1],[1,1],[0,2]],
  F:  [[1,0],[2,0],[0,1],[1,1],[1,2]],
  Z:  [[0,0],[1,0],[1,1],[1,2],[2,2]],
  W:  [[0,0],[0,1],[1,1],[1,2],[2,2]],
  V:  [[0,0],[0,1],[0,2],[1,2],[2,2]],
}

function rotateCW(cells: Cell[]): Cell[] {
  const maxR = Math.max(...cells.map(([,r]) => r))
  return cells.map(([c, r]) => [maxR - r, c])
}

function normalise(cells: Cell[]): Cell[] {
  const minC = Math.min(...cells.map(([c]) => c))
  const minR = Math.min(...cells.map(([,r]) => r))
  return cells.map(([c, r]) => [c - minC, r - minR])
}

function buildRotations(base: Cell[]): Cell[][] {
  const rotations: Cell[][] = []
  let cur = base
  for (let i = 0; i < 4; i++) {
    const norm = normalise(cur)
    const key = JSON.stringify(norm)
    if (!rotations.some(r => JSON.stringify(normalise(r)) === key)) {
      rotations.push(norm)
    }
    cur = rotateCW(cur)
  }
  return rotations
}

export const PIECES: Record<PieceType, Cell[][]> = Object.fromEntries(
  (Object.entries(CANONICAL) as [PieceType, Cell[]][]).map(
    ([type, cells]) => [type, buildRotations(cells)]
  )
) as Record<PieceType, Cell[][]>
