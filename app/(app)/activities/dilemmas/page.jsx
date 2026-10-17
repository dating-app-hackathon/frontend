'use client'

// Moral Mirror: timed dilemmas. What you pick matters, and so does how long you take.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { logActivity } from '@/lib/api'
import '../questions/questions.css'
import './dilemmas.css'

const SECONDS = 6
const RING = 2 * Math.PI * 26

const DILEMMAS = [
  ['A pill removes heartbreak forever. It also removes butterflies.', 'Take it', 'Keep both'],
  ['Your partner can read your thoughts, one day a year.', 'Deal', 'Never'],
  ['An AI writes all your texts. Everyone likes you more.', 'Let it', 'Keep my typos'],
  ['You can know the exact date you meet "the one".', 'Tell me', "Don't spoil it"],
  ['Live forever, but only in a city you have never visited.', 'Forever', 'Pass'],
  ['Delete your most embarrassing memory, and the friend who was there.', 'Delete', 'Keep both'],
]

function verdict(avg) {
  if (avg < 2) return ['⚡', 'Gut feeling', 'You know what you want, and fast.']
  if (avg < 4) return ['⚖️', 'Weigher', 'You think it through, then commit.']
  return ['🌀', 'Philosopher', 'Every answer is a whole debate. Respect.']
}

export default function Dilemmas() {
  const [i, setI] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [answers, setAnswers] = useState([]) // { choice, time } per dilemma
  const startedAt = useRef(performance.now())
  const answered = useRef(false) // one answer per dilemma, even on double taps

  const done = i >= DILEMMAS.length

  function answer(choice) {
    if (answered.current) return
    answered.current = true
    const time = (performance.now() - startedAt.current) / 1000
    setAnswers((a) => [...a, { choice, time: Math.min(time, SECONDS) }])
    if (choice) logActivity(3)
    setI((n) => n + 1)
  }

  // countdown: run out of time and you "froze"
  useEffect(() => {
    if (done) return
    startedAt.current = performance.now()
    answered.current = false
    setElapsed(0)
    const id = setInterval(() => {
      const t = (performance.now() - startedAt.current) / 1000
      if (t >= SECONDS) answer(null)
      else setElapsed(t)
    }, 100)
    return () => clearInterval(id)
  }, [i, done])

  if (done) {
    const decided = answers.filter((a) => a.choice)
    const avg = decided.length ? decided.reduce((s, a) => s + a.time, 0) / decided.length : SECONDS
    const fastest = decided.length ? answers.indexOf(decided.reduce((a, b) => (b.time < a.time ? b : a))) : -1
    const [emoji, title, text] = decided.length ? verdict(avg) : ['🧊', 'Frozen', 'Six dilemmas, zero answers. Mysterious.']

    return (
      <main className="app-page">
        <Link href="/activities" className="q-back">← Activities</Link>
        <section className="app-card dl-result">
          <span className="dl-result-emoji">{emoji}</span>
          <small>Your moral mirror</small>
          <h2>{title}</h2>
          <p>{text}</p>
          <dl className="dl-stats">
            <div>
              <dt>Avg hesitation</dt>
              <dd>{avg.toFixed(1)}s</dd>
            </div>
            <div>
              <dt>Froze</dt>
              <dd>{answers.length - decided.length}×</dd>
            </div>
          </dl>
          {fastest >= 0 && (
            <p className="dl-fastest">
              No hesitation on: <strong>“{DILEMMAS[fastest][0]}”</strong> → {answers[fastest].choice}
            </p>
          )}
          <Link href="/syncs" className="cta">
            See my syncs <span>→</span>
          </Link>
        </section>
      </main>
    )
  }

  const [question, a, b] = DILEMMAS[i]
  const left = SECONDS - elapsed

  return (
    <main className="app-page">
      <Link href="/activities" className="q-back">← Activities</Link>

      <header className="q-head">
        <h1 className="app-title">
          Moral <span className="pink">mirror</span>
        </h1>
        <span className="q-score">
          {i + 1}/{DILEMMAS.length}
        </span>
      </header>

      <section key={i} className="app-card dl-card">
        <div className={`dl-timer ${left < 2 ? 'hurry' : ''}`}>
          <svg viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" className="track" />
            <circle cx="30" cy="30" r="26" className="fill" strokeDasharray={RING} strokeDashoffset={RING * (elapsed / SECONDS)} />
          </svg>
          <span>{Math.ceil(left)}</span>
        </div>

        <h2>{question}</h2>

        <div className="dl-choices">
          <button onClick={() => answer(a)}>{a}</button>
          <button onClick={() => answer(b)}>{b}</button>
        </div>
        <small className="dl-note">We're timing you. No pressure. (Some pressure.)</small>
      </section>
    </main>
  )
}
