// Mock speech-to-text: swallows the audio, returns a canned transcript.
const FAKE = ['Honestly? Music and long walks at night.', 'Probably my friends would say chaotic but kind.', 'I like people who just say what they mean.']

export async function POST(req) {
  const audio = await req.arrayBuffer()
  return Response.json({ text: FAKE[Math.floor(Math.random() * FAKE.length)], bytes: audio.byteLength })
}
