// Silent listening shared by all providers: records the mic (no browser speech UI,
// no beeps), ends the turn after a pause, and sends the audio off for transcription.
//   POST {VOICE_URL}/listen  body: audio blob -> { text }
// Without NEXT_PUBLIC_VOICE_URL the mock backend makes up a transcript.

import { transcribe } from '@/lib/api'

const VOICE_URL = process.env.NEXT_PUBLIC_VOICE_URL
const LOUD = 15 // average mic level that counts as talking
const SILENCE_MS = 1500 // pause that ends your answer
const NO_ANSWER_MS = 8000 // give up if you never start talking
const MAX_ANSWER_MS = 20000

let stream = null
let recorder = null

export async function listen() {
  stream ??= await navigator.mediaDevices.getUserMedia({ audio: true })

  const audioCtx = new AudioContext()
  const analyser = audioCtx.createAnalyser()
  audioCtx.createMediaStreamSource(stream).connect(analyser)
  const levels = new Uint8Array(analyser.frequencyBinCount)

  const chunks = []
  recorder = new MediaRecorder(stream)
  recorder.ondataavailable = (e) => chunks.push(e.data)
  const stopped = new Promise((resolve) => (recorder.onstop = resolve))
  recorder.start()

  const startedAt = performance.now()
  let lastVoiceAt = null
  await new Promise((resolve) => {
    const check = () => {
      if (recorder?.state !== 'recording') return resolve()
      analyser.getByteFrequencyData(levels)
      const now = performance.now()
      if (levels.reduce((a, b) => a + b, 0) / levels.length > LOUD) lastVoiceAt = now
      const finished = lastVoiceAt ? now - lastVoiceAt > SILENCE_MS : now - startedAt > NO_ANSWER_MS
      if (finished || now - startedAt > MAX_ANSWER_MS) return resolve()
      setTimeout(check, 100)
    }
    check()
  })

  if (recorder?.state === 'recording') recorder.stop()
  await stopped
  recorder = null
  audioCtx.close()

  if (!lastVoiceAt) return '(no response detected)'
  const audio = new Blob(chunks)
  if (!VOICE_URL) return transcribe(audio)
  const res = await fetch(`${VOICE_URL}/listen`, { method: 'POST', body: audio })
  return (await res.json()).text
}

// Ends any answer in progress and lets go of the mic
export function release() {
  if (recorder?.state === 'recording') recorder.stop()
  stream?.getTracks().forEach((t) => t.stop())
  stream = null
}
