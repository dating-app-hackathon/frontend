// Mock text-to-speech: no audio yet, the client just waits a beat instead.
export async function POST() {
  return new Response(null, { status: 204 })
}
