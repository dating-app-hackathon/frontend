'use client'

import { useEffect, useState } from 'react'
import Avatar from '@/components/Avatar'
import { shade, shadeName, RAINBOW } from '@/components/Spectrum'
import { getProfile } from '@/lib/api'
import { ageOf, signOf, feetOf } from '@/lib/people'
import './me.css'

// Shown for anything the person hasn't filled in (e.g. after a dev server restart)
const DEMO = {
  name: 'Alex',
  pronouns: ['they/them'],
  birthdate: '1998-10-02',
  height: 174,
  eyes: 'Hazel',
  gender: 0.5,
  attraction: [0, 1],
  job: 'UX designer',
  degree: "Master's",
  degreeField: 'Design',
  gym: 'sometimes',
  languages: ['English', 'Italian'],
  bio: "Plant parent, terrible at karaoke, unbeatable at board games.\nPerfect Sunday: farmers' market, then a nap I'll deny taking.",
  vibe: { emoji: '🌙', vibe: 'Late-night Philosopher', description: 'Deep talks, slow walks, zero small talk.', sync: 92 },
}

const GYM = { rat: '🏋️ Gym-rat', sometimes: '🚶 Sometimes', perfect: '💅 Perfect as-is' }

export default function Me() {
  const [p, setP] = useState(null)

  useEffect(() => {
    getProfile().then((real) => setP({ ...DEMO, ...real }))
  }, [])

  if (!p) return <main className="app-page" />

  const everyone = p.attraction[0] <= 0.03 && p.attraction[1] >= 0.97
  const genderColour = p.gender === 'every' ? RAINBOW : shade(p.gender)
  const details = [
    ['Job', p.job],
    ['Degree', p.degreeField ? `${p.degree}, ${p.degreeField}` : p.degree],
    ['Gym', GYM[p.gym]],
    ['Height', `${p.height} cm · ${feetOf(p.height)}`],
    ['Eyes', p.eyes],
    ['Star sign', signOf(p.birthdate)],
  ]

  return (
    <main className="app-page">
      <section className="me-hero">
        <Avatar hue={p.gender} size={104} />
        <h1 className="app-title">
          {p.name}, <span className="pink">{ageOf(p.birthdate)}</span>
        </h1>
        {p.pronouns.length > 0 && <p className="app-lead">{p.pronouns.join(' · ')}</p>}
      </section>

      <section className="app-card me-vibe">
        <span className="me-vibe-emoji">{p.vibe.emoji}</span>
        <div>
          <small>your vibe</small>
          <h2>{p.vibe.vibe}</h2>
          <p>{p.vibe.description}</p>
        </div>
      </section>

      <section className="app-card">
        <h3 className="me-label">In my own words</h3>
        <p className="me-bio">{p.bio}</p>
      </section>

      <section className="me-grid">
        {details.map(([label, value]) => (
          <div key={label} className="app-card me-tile">
            <h3 className="me-label">{label}</h3>
            <p>{value}</p>
          </div>
        ))}
      </section>

      <section className="app-card">
        <h3 className="me-label">Languages</h3>
        <div className="app-chips">
          {p.languages.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </section>

      <section className="app-card me-colours">
        <div>
          <h3 className="me-label">My shade</h3>
          <div className="me-shade">
            <span style={{ background: genderColour }} />
            {p.gender === 'every' ? 'Every colour 🌈' : shadeName(p.gender)}
          </div>
        </div>
        <div>
          <h3 className="me-label">I vibe with</h3>
          <div
            className="me-range"
            style={{
              background: everyone ? RAINBOW.replace('conic-gradient(', 'linear-gradient(90deg, ') : `linear-gradient(90deg, ${shade(p.attraction[0])}, ${shade(p.attraction[1])})`,
            }}
          />
          <small>{everyone ? 'Every colour 🌈' : `${shadeName(p.attraction[0])} → ${shadeName(p.attraction[1])}`}</small>
        </div>
      </section>
    </main>
  )
}
