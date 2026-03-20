// SERVER ONLY — vends the next piece for a session.
// The seed lives on the server. The client never sees it.
// Rate-limited by session expiry and piece index to prevent replays.

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getPieceAtIndex } from '@/lib/games/stack-rush/engine/rng'
import type { Database } from '@/types/database'
import type { Bracket } from '@/types/game'

type GameSession = Database['public']['Tables']['game_sessions']['Row']

export async function POST(req: NextRequest) {
  const body = await req.json() as { sessionId: string; pieceIndex: number }
  const { sessionId, pieceIndex } = body

  const admin = createAdminClient()
  const { data: sessionRaw, error } = await admin
    .from('game_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
  const session = sessionRaw as GameSession | null

  if (error || !session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 404 })
  }

  // Session expiry check
  if (new Date(session.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Session expired' }, { status: 410 })
  }

  // Prevent skipping ahead — client must request pieces in order
  if (pieceIndex !== session.piece_index) {
    return NextResponse.json({ error: 'Piece index mismatch' }, { status: 400 })
  }

  // Advance piece index
  await admin
    .from('game_sessions')
    .update({ piece_index: pieceIndex + 1 })
    .eq('id', sessionId)

  // Compute piece from seed + index — seed never leaves server
  const pieceType = getPieceAtIndex(session.seed, pieceIndex, session.bracket as Bracket)

  return NextResponse.json({ pieceType, pieceIndex })
}
