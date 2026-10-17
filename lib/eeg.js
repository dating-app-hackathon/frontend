// Simulated EEG headset. Swap this for a real stream later: the panel only needs
// CHANNELS, SAMPLE_RATE and next(focused) -> one sample per channel (roughly -1..1).

export const SAMPLE_RATE = 256

export const CHANNELS = [
  { name: 'Fp1', color: '#fd4269' },
  { name: 'Fp2', color: '#ff9f43' },
  { name: 'C3', color: '#e8a317' },
  { name: 'C4', color: '#14b88a' },
  { name: 'T3', color: '#1fb3d9' },
  { name: 'T4', color: '#54a0ff' },
  { name: 'O1', color: '#a55eea' },
  { name: 'O2', color: '#ff6bcb' },
]

const TAU = Math.PI * 2

export function createEEG() {
  let t = 0
  let blink = 0
  const phase = CHANNELS.map(() => Math.random() * TAU)

  // focused (talking): more beta (fast waves), less alpha (relaxed waves)
  return function next(focused) {
    t += 1 / SAMPLE_RATE
    if (blink <= 0 && Math.random() < 0.001) blink = 1
    blink = Math.max(0, blink - 0.01)

    return CHANNELS.map((_, i) => {
      const p = phase[i]
      const alpha = Math.sin(TAU * 10 * t + p) * (focused ? 0.2 : 0.55)
      const beta = Math.sin(TAU * 21 * t + p * 2) * (focused ? 0.4 : 0.12)
      const theta = Math.sin(TAU * 6 * t + p * 3) * 0.25
      const noise = (Math.random() - 0.5) * 0.3
      const blinkArtifact = i < 2 ? Math.sin(blink * Math.PI) * 1.6 : 0 // eye blinks show up on the frontal channels
      return alpha + beta + theta + noise + blinkArtifact
    })
  }
}
