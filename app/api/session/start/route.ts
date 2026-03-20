// SERVER ONLY — seed is generated and stored here, never sent to the client.
// The client receives only a sessionId. Pieces are vended one at a time
// via /api/session/piece, keyed to the session.

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Bracket, GameMode } from '@/types/game'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await req.json() as { bracket: Bracket; mode: GameMode; matchId?: string }
  const { bracket, mode, matchId } = body

  // Generate seed server-side — never leaves this function
  const seed = Math.floor(Math.random() * 999_999) + 1

  const sessionId = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 6 * 60 * 1000).toISOString() // 6 min (5 min game + buffer)

  // Store session in Supabase (admin client bypasses RLS)
  const admin = createAdminClient()
  const { error } = await admin.from('game_sessions').insert({
    id: sessionId,
    user_id: user?.id ?? null,
    seed,
    bracket,
    mode,
    match_id: matchId ?? null,
    piece_index: 0,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }

  // Return session token — seed is NOT included
  return NextResponse.json({
    sessionId,
    bracket,
    gameMode: mode,
    expiresAt,
  })
}
