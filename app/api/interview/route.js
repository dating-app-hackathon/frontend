// Mock interview backend.
// GET  /api/interview -> the questions the interviewer asks, plus a closing line
// POST /api/interview -> { answers } in, a fake vibe result out (also saved on the profile)

import { db } from '@/lib/db'

const QUESTIONS = [
  { id: 'passion', text: "Hi! I'm so glad you're here. Let's start simple — what's something you're genuinely passionate about?" },
  { id: 'weekend', text: "That's great to hear. What does a perfect weekend look like for you?" },
  { id: 'friends', text: 'Nice. How would your friends describe your personality in three words?' },
  { id: 'trust', text: "Interesting! What's something that instantly makes you trust someone?" },
  { id: 'looking', text: 'Got it. And what are you hoping to find here — something casual, or something more serious?' },
]
const OUTRO = "Thanks so much for sharing all of that with me — that's everything I needed!"

const VIBES = [
  ['🌙', 'Late-night Philosopher', 'Deep talks, slow walks, zero small talk.'],
  ['🐶', 'Golden Retriever Energy', 'Warm, loyal, and genuinely excited to see people.'],
  ['🎬', 'Main Character', 'Big plans, bigger stories, everyone wants a cameo.'],
  ['🌪️', 'Chaotic Good', 'Spontaneous, kind, and always up for a detour.'],
]

export async function GET() {
  return Response.json({ questions: QUESTIONS, outro: OUTRO })
}

export async function POST(req) {
  const { answers = {} } = await req.json()
  const [emoji, vibe, description] = VIBES[Math.floor(Math.random() * VIBES.length)]
  const result = { emoji, vibe, description, sync: 80 + Math.floor(Math.random() * 20) }
  db.profile.vibe = result
  db.profile.boost = (db.profile.boost ?? 0) + 10 // 'Talk to the AI' activity
  return Response.json({ ...result, answered: Object.keys(answers).length })
}
