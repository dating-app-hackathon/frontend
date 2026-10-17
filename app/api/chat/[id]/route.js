// Mock chat with a sync.
// GET  /api/chat/:id -> { sync, messages }
// POST /api/chat/:id -> { text } in, { reply } out (the client fakes the typing delay)

import { db } from '@/lib/db'
import { SYNCS } from '@/lib/syncs'

const REPLIES = [
  "Haha okay, that's very you 😄",
  'Wait, tell me more',
  'The algorithm really did its homework huh',
  'Same!! Okay we need to talk about this properly',
  "Ok you're officially interesting",
  'Coffee and continue this in person? ☕',
]

async function load(params) {
  const { id } = await params
  const sync = SYNCS.find((s) => s.id === id)
  if (!sync) return {}
  db.chats ??= {}
  db.chats[id] ??= [{ from: 'them', text: sync.opener }]
  return { sync, messages: db.chats[id] }
}

export async function GET(req, { params }) {
  const { sync, messages } = await load(params)
  if (!sync) return Response.json({ error: 'not found' }, { status: 404 })
  return Response.json({ sync, messages })
}

export async function POST(req, { params }) {
  const { sync, messages } = await load(params)
  if (!sync) return Response.json({ error: 'not found' }, { status: 404 })
  const { text } = await req.json()
  const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)]
  messages.push({ from: 'me', text }, { from: 'them', text: reply })
  return Response.json({ reply })
}
