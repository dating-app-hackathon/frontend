// Fake backend: in-memory state that lives as long as the dev server does.
let vibers = 2400 + Math.floor(Math.random() * 600)

export async function GET() {
  vibers += Math.floor(Math.random() * 21) - 8
  return Response.json({ vibers })
}
