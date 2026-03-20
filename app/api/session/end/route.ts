// SERVER ONLY — finalises a session, validates the result, writes to leaderboard.

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { GameResult } from '@/types/game'
import type { Database } from '@/types/database'
import { BRACKETS } from '@/lib/games/stack-rush/engine/brackets'

type GameSession = Database['public']['Tables']['game_sessions']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await req.json() as GameResult
  const { sessionId, score, bands, maxTier, xpEarned } = body

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

  // Mark session complete to prevent double-submission
  const { error: updateErr } = await admin
    .from('game_sessions')
    .update({ completed: true })
    .eq('id', sessionId)
    .eq('completed', false) // atomic — only succeeds once

  if (updateErr) {
    return NextResponse.json({ error: 'Session already completed' }, { status: 409 })
  }

  // Sanity check — score should be plausible given bands and tier
  const maxPlausibleScore = bands * maxTier * 1000 * 2
  if (score > maxPlausibleScore) {
    return NextResponse.json({ error: 'Score rejected' }, { status: 422 })
  }

  if (!user) {
    // Guest — nothing to persist
    return NextResponse.json({ success: true, xpEarned: 0 })
  }

  // Write to leaderboard
  await admin.from('leaderboard').insert({
    user_id: user.id,
    username: user.user_metadata?.username ?? 'Unknown',
    score,
    bands,
    tier: maxTier,
    seed: session.seed,
    bracket: session.bracket,
  })

  // Update profile XP
  const { data: profileRaw } = await admin
    .from('profiles')
    .select('xp, sessions, trophies')
    .eq('id', user.id)
    .single()
  const profile = profileRaw as Pick<Profile, 'xp' | 'sessions' | 'trophies'> | null

  if (profile) {
    const newXp = profile.xp + xpEarned
    const newBracket = BRACKETS.find(b => newXp >= b.minXp && newXp < b.maxXp)?.name ?? 'master'

    await admin.from('profiles').update({
      xp: newXp,
      sessions: profile.sessions + 1,
      bracket: newBracket,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)
  }

  return NextResponse.json({ success: true, xpEarned })
}
