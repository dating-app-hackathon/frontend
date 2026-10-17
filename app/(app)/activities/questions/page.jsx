'use client'

import { useState } from 'react'
import Link from 'next/link'
import { logActivity } from '@/lib/api'
import './questions.css'

const MAX = 200
const QUESTIONS = [
  "What's a hill you'd happily die on?",
  'The last thing that made you laugh out loud?',
  'A green flag nobody talks about?',
  'Your comfort movie, and why?',
  "What's something you're quietly proud of?",
  'Pineapple on pizza: defend your answer.',
  'What does a good Sunday morning look like?',
  "A deal-breaker you've learned the hard way?",
]

export default function Questions() {
  const [i, setI] = useState(0)
  const [answer, setAnswer] = useState('')
  const [answered, setAnswered] = useState(0)

  const done = i >= QUESTIONS.length

  async function send(e) {
    e.preventDefault()
    if (!answer.trim()) return
    setAnswered(answered + 1)
    setAnswer('')
    setI(i + 1)
    await logActivity(5)
  }

  function skip() {
    setAnswer('')
    setI(i + 1)
  }

  return (
    <main className="app-page">
      <Link href="/activities" className="q-back">← Activities</Link>

      <header className="q-head">
        <h1 className="app-title">
          Answer <span className="pink">questions</span>
        </h1>
        <span className="q-score">+{answered * 5} sync</span>
      </header>

      <div className="q-progress">
        {QUESTIONS.map((_, n) => (
          <span key={n} className={n < i ? 'done' : n === i ? 'now' : ''} />
        ))}
      </div>

      {done ? (
        <section className="app-card q-card q-done">
          <span>🎉</span>
          <h2>That's all of them!</h2>
          <p>{answered} answers in. Your syncs just got sharper.</p>
          <Link href="/syncs" className="cta">
            See my syncs <span>→</span>
          </Link>
        </section>
      ) : (
        <form key={i} className="app-card q-card" onSubmit={send}>
          <small>
            Question {i + 1} of {QUESTIONS.length}
          </small>
          <h2>{QUESTIONS[i]}</h2>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            maxLength={MAX}
            rows={4}
            placeholder="Be honest, nobody's swiping."
            autoFocus
          />
          <span className="q-count">{MAX - answer.length}</span>
          <div className="q-actions">
            <button type="button" className="q-skip" onClick={skip}>
              Skip
            </button>
            <button className="q-send" disabled={!answer.trim()}>
              Send <span>→</span>
            </button>
          </div>
        </form>
      )}
    </main>
  )
}
