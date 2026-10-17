// Fake backend, running in the browser (the app is deployed as a static site).
// Every call waits a moment like a real request would. When a real backend exists,
// swap these bodies for fetch() calls and keep the same function names.

import { load, update } from '@/lib/db'
import { SYNCS } from '@/lib/syncs'

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms))
const pick = (list) => list[Math.floor(Math.random() * list.length)]

// ---------- landing ----------
let vibers = 2400 + Math.floor(Math.random() * 600)

export async function getLiveVibers() {
  await wait()
  vibers += Math.floor(Math.random() * 21) - 8
  return vibers
}

// ---------- profile (each onboarding step saves its part) ----------
export async function saveProfile(part) {
  await wait()
  return update((db) => (db.profile = { ...db.profile, ...part })).profile
}

export async function getProfile() {
  await wait(150)
  return load().profile
}

// ---------- body scan ----------
const BODY_TYPES = [
  ['Huggable', 'The kind of presence people want to wrap their arms around.'],
  ['Cute-as-a-Button', 'Effortlessly adorable, inside and out.'],
  ['Effortlessly Elegant', 'You carry yourself with natural grace.'],
  ['Cozy & Cuddly', 'Warm energy that makes people feel at home.'],
  ['Sculpted & Strong', 'Strength that turns heads and inspires confidence.'],
  ['Soft & Sweet', "A gentle charm that's hard not to notice."],
  ['Playfully Petite', 'Small in size, big in personality.'],
  ['Tall & Charming', 'Standing out in the best possible way.'],
  ['Warm & Inviting', 'The kind of energy that puts people at ease.'],
  ['Naturally Radiant', "A glow that doesn't need any filters."],
]

export async function submitBodyScan() {
  await wait(800)
  const [bodyType, bodyBlurb] = pick(BODY_TYPES)
  const result = { bodyType, bodyBlurb, posture: pick(['Excellent', 'Good', 'Great']), symmetry: 88 + Math.floor(Math.random() * 9), completedAt: Date.now() }
  update((db) => (db.profile.bodyscan = result))
  return result
}

// ---------- interview ----------
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

export async function getInterview() {
  await wait()
  return { questions: QUESTIONS, outro: OUTRO }
}

export async function submitInterview(answers = {}) {
  await wait(600)
  const [emoji, vibe, description] = pick(VIBES)
  const result = { emoji, vibe, description, sync: 80 + Math.floor(Math.random() * 20) }
  update((db) => {
    db.profile.vibe = result
    db.profile.boost = (db.profile.boost ?? 0) + 10 // 'Talk to the AI' activity
  })
  return { ...result, answered: Object.keys(answers).length }
}

// ---------- voice (used by lib/voice when no real speech server is configured) ----------
const FAKE_TRANSCRIPTS = ['Honestly? Music and long walks at night.', 'Probably my friends would say chaotic but kind.', 'I like people who just say what they mean.']

export async function transcribe() {
  await wait(400)
  return pick(FAKE_TRANSCRIPTS)
}

// ---------- syncs + chat ----------
const REPLIES = [
  "Haha okay, that's very you 😄",
  'Wait, tell me more',
  'The algorithm really did its homework huh',
  'Same!! Okay we need to talk about this properly',
  "Ok you're officially interesting",
  'Coffee and continue this in person? ☕',
]

export async function getSyncs() {
  await wait()
  return SYNCS
}

export async function getChat(id) {
  await wait(150)
  const sync = SYNCS.find((s) => s.id === id)
  if (!sync) return {}
  const db = update((db) => {
    db.chats ??= {}
    db.chats[id] ??= [{ from: 'them', text: sync.opener }]
  })
  return { sync, messages: db.chats[id] }
}

export async function sendMessage(id, text) {
  await wait()
  const reply = pick(REPLIES)
  update((db) => {
    db.chats ??= {}
    db.chats[id] ??= [{ from: 'them', text: SYNCS.find((s) => s.id === id)?.opener }]
    db.chats[id].push({ from: 'me', text }, { from: 'them', text: reply })
  })
  return reply
}

// ---------- activities: every activity adds sync points ----------
const strengthOf = (profile) => Math.min(99, 42 + (profile.boost ?? 0))

export async function getSyncStrength() {
  await wait(150)
  return strengthOf(load().profile)
}

export async function logActivity(points) {
  await wait(100)
  return strengthOf(update((db) => (db.profile.boost = (db.profile.boost ?? 0) + points)).profile)
}
