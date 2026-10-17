'use client'

// Memory Auction: 100 coins, six memories. Whatever gets no bid is "forgotten".

import { useState } from 'react'
import Link from 'next/link'
import { logActivity } from '@/lib/api'
import '../questions/questions.css'
import './auction.css'

const BUDGET = 100
const STEP = 10
const MEMORIES = [
  ['💋', 'Your first kiss'],
  ['🏖️', 'A childhood summer'],
  ['🏆', 'The day you were proudest'],
  ['😂', 'Laughing until you cried'],
  ['🫂', 'A goodbye that mattered'],
  ['💔', 'A heartbreak (you keep the lesson)'],
]

export default function Auction() {
  const [bids, setBids] = useState(MEMORIES.map(() => 0))
  const [locked, setLocked] = useState(false)

  const left = BUDGET - bids.reduce((a, b) => a + b, 0)
  const bid = (i, delta) => setBids(bids.map((b, n) => (n === i ? Math.max(0, b + delta) : b)))

  function lock() {
    setLocked(true)
    logActivity(8)
  }

  if (locked) {
    const ranked = MEMORIES.map((m, i) => [...m, bids[i]]).sort((a, b) => b[2] - a[2])
    const kept = ranked.filter((m) => m[2] > 0)
    const lost = ranked.filter((m) => m[2] === 0)

    return (
      <main className="app-page">
        <Link href="/activities" className="q-back">← Activities</Link>
        <section className="app-card au-result">
          <span className="au-result-emoji">{kept[0][0]}</span>
          <small>Worth the most to you</small>
          <h2>{kept[0][1]}</h2>
          <ol className="au-ranked">
            {kept.map(([emoji, name, coins]) => (
              <li key={name}>
                <span>
                  {emoji} {name}
                </span>
                <b>{coins}</b>
              </li>
            ))}
          </ol>
          {lost.length > 0 && (
            <p className="au-lost">
              Forgotten by morning: {lost.map((m) => m[1].toLowerCase()).join(', ')}. (Kidding. Mostly.)
            </p>
          )}
          <Link href="/syncs" className="cta">
            See my syncs <span>→</span>
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="app-page">
      <Link href="/activities" className="q-back">← Activities</Link>

      <header className="q-head">
        <h1 className="app-title">
          Memory <span className="pink">auction</span>
        </h1>
        <span className={`q-score au-left ${left === 0 ? 'zero' : ''}`}>🪙 {left}</span>
      </header>
      <p className="app-lead">You keep only what you bid on. Spend all {BUDGET} coins.</p>

      <div className="au-list">
        {MEMORIES.map(([emoji, name], i) => (
          <div key={name} className={`app-card au-item ${bids[i] ? 'bid' : ''}`}>
            <span className="au-emoji">{emoji}</span>
            <div className="au-body">
              <strong>{name}</strong>
              <div className="au-bar">
                <span style={{ width: `${bids[i]}%` }} />
              </div>
            </div>
            <div className="au-controls">
              <button onClick={() => bid(i, -STEP)} disabled={!bids[i]} aria-label={`Bid less on ${name}`}>
                −
              </button>
              <b>{bids[i]}</b>
              <button onClick={() => bid(i, STEP)} disabled={left < STEP} aria-label={`Bid more on ${name}`}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cta-bar au-cta">
        <button className="cta" disabled={left !== 0} onClick={lock}>
          {left ? `${left} coins left` : <>Lock in my bids <span>→</span></>}
        </button>
      </div>
    </main>
  )
}
