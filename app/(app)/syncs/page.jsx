'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Avatar from '@/components/Avatar'
import SyncMap from '@/components/SyncMap'
import { getProfile, getSyncs } from '@/lib/api'
import './syncs.css'

const RING = 2 * Math.PI * 22

export default function Syncs() {
  const [syncs, setSyncs] = useState(null)
  const [myVibe, setMyVibe] = useState(null)

  useEffect(() => {
    getSyncs().then(setSyncs)
    getProfile().then((p) => setMyVibe(p.vibe?.vibe ?? 'Late-night Philosopher'))
  }, [])

  return (
    <main className="app-page">
      <h1 className="app-title">
        Your <span className="pink">syncs</span>
      </h1>
      <p className="app-lead">No swiping, no maybes. The algorithm decided, the chats are open.</p>

      {!syncs && <p className="app-lead">tuning in…</p>}

      {syncs && myVibe && (
        <section className="app-card syncs-map">
          <h2 className="syncs-map-title">Your sync map</h2>
          <SyncMap yourVibe={myVibe} syncs={syncs.map((s) => ({ id: s.id, name: s.name, vibe: s.vibe[1], sync: s.sync }))} />
        </section>
      )}

      <div className="syncs">
        {syncs?.map((s, i) => (
          <Link key={s.id} href={`/chat/${s.id}`} className="app-card sync" style={{ animationDelay: `${i * 0.08}s` }}>
            {i === 0 && <span className="sync-top">Top sync</span>}

            <header>
              <Avatar hue={s.shade} size={60} />
              <div className="sync-who">
                <h2>
                  {s.name}, {s.age}
                </h2>
                <small>
                  {s.pronouns} · {s.vibe[0]} {s.vibe[1]}
                </small>
              </div>
              <div className="sync-ring" aria-label={`${s.sync}% in sync`}>
                <svg viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="22" className="track" />
                  <circle
                    cx="26"
                    cy="26"
                    r="22"
                    className="fill"
                    strokeDasharray={RING}
                    strokeDashoffset={RING * (1 - s.sync / 100)}
                  />
                </svg>
                <span>{s.sync}%</span>
              </div>
            </header>

            <p className="sync-why">“{s.why}”</p>

            <div className="app-chips">
              {s.shared.map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>

            <p className="sync-open">
              <span>{s.opener}</span>
              <b>Chat →</b>
            </p>
          </Link>
        ))}
      </div>
    </main>
  )
}
