// Mock profile store. Each onboarding step POSTs its part and it gets merged in.
import { db } from '@/lib/db'

export async function GET() {
  return Response.json({ profile: db.profile })
}

export async function POST(req) {
  db.profile = { ...db.profile, ...(await req.json()) }
  return Response.json({ ok: true, profile: db.profile })
}
