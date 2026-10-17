// Local speech-to-speech server. Not built yet: these endpoints are mocked in
// app/api/voice. Point NEXT_PUBLIC_VOICE_URL at the real thing when it exists.
//   POST {VOICE_URL}/speak   body: { text }    -> audio (or 204 if nothing to play)
//   POST {VOICE_URL}/listen  body: audio blob  -> { text }   (see ./mic)

import { listen, release } from './mic'

const VOICE_URL = process.env.NEXT_PUBLIC_VOICE_URL ?? '/api/voice'

let audio = null

async function speak(text) {
  const res = await fetch(`${VOICE_URL}/speak`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  // No audio back (e.g. the mock): pretend we talked for a moment
  if (res.status === 204) return new Promise((r) => setTimeout(r, text.length * 50))

  audio = new Audio(URL.createObjectURL(await res.blob()))
  return new Promise((resolve) => {
    audio.onended = audio.onerror = resolve
    audio.play()
  })
}

function stop() {
  audio?.pause()
  release()
}

export default { speak, listen, stop }
