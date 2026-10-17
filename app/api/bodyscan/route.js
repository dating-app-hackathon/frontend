export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'

const BODY_TYPES = [
  { label: 'Huggable', blurb: 'The kind of presence people want to wrap their arms around.' },
  { label: 'Cute-as-a-Button', blurb: 'Effortlessly adorable, inside and out.' },
  { label: 'Effortlessly Elegant', blurb: 'You carry yourself with natural grace.' },
  { label: 'Cozy & Cuddly', blurb: 'Warm energy that makes people feel at home.' },
  { label: 'Sculpted & Strong', blurb: 'Strength that turns heads and inspires confidence.' },
  { label: 'Soft & Sweet', blurb: 'A gentle charm that\'s hard not to notice.' },
  { label: 'Playfully Petite', blurb: 'Small in size, big in personality.' },
  { label: 'Tall & Charming', blurb: 'Standing out in the best possible way.' },
  { label: 'Warm & Inviting', blurb: 'The kind of energy that puts people at ease.' },
  { label: 'Naturally Radiant', blurb: 'A glow that doesn\'t need any filters.' },
]


const POSTURE_OPTIONS = ['Excellent', 'Good', 'Great']
const SYMMETRY_RANGE = [88, 97]


export async function POST(req) {
  await req.json().catch(() => ({}))

  const picked = BODY_TYPES[Math.floor(Math.random() * BODY_TYPES.length)]
  const posture = POSTURE_OPTIONS[Math.floor(Math.random() * POSTURE_OPTIONS.length)]
  const symmetry =
    SYMMETRY_RANGE[0] + Math.floor(Math.random() * (SYMMETRY_RANGE[1] - SYMMETRY_RANGE[0]))

  const result = {
    bodyType: picked.label,
    bodyBlurb: picked.blurb,
    posture,
    symmetry,
    completedAt: Date.now(),
  }
  db.profile.bodyscan = result
  return Response.json(result)
}