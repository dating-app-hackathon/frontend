export const dynamic = 'force-dynamic'

const BODY_TYPES = ['Athletic', 'Lean', 'Average', 'Curvy', 'Muscular', 'Toned']

export async function POST(req) {
  await req.json().catch(() => ({}))
  const bodyType = BODY_TYPES[Math.floor(Math.random() * BODY_TYPES.length)]
  return Response.json({ bodyType, completedAt: Date.now() })
}
