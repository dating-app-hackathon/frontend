// Mock activity tracker: every activity adds sync points to your profile.
// GET  /api/activity -> { strength } (0-99, how sharp your syncs are)
// POST /api/activity -> { points } in, new strength out

import { db } from '@/lib/db'

const strength = () => Math.min(99, 42 + (db.profile.boost ?? 0))

export async function GET() {
  return Response.json({ strength: strength() })
}

export async function POST(req) {
  const { points = 1 } = await req.json()
  db.profile.boost = (db.profile.boost ?? 0) + points
  return Response.json({ strength: strength() })
}
