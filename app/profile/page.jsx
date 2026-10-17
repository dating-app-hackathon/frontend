'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Spectrum, { shade, shadeName, RAINBOW } from '@/components/Spectrum'
import { saveProfile } from '@/lib/api'
import { ageOf, signOf, feetOf } from '@/lib/people'
import '../form.css'
import './profile.css'

const PRONOUNS = ['she/her', 'he/him', 'they/them', 'any/all', 'ask me!']
const EYES = [
  ['Brown', '#6b3e1f'],
  ['Hazel', '#8e6b2f'],
  ['Amber', '#c98a1b'],
  ['Green', '#4f8a3c'],
  ['Blue', '#3f7fd0'],
  ['Grey', '#8a96a3'],
  ['Heterochromia', 'linear-gradient(90deg, #3f7fd0 50%, #6b3e1f 50%)'],
]
const iris = (c) => `radial-gradient(circle, #0b0b0d 0 26%, transparent 28%), ${c.startsWith('#') ? `radial-gradient(circle, ${c} 40%, #0b0b0d 100%)` : c}`

export default function Profile() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [pronouns, setPronouns] = useState([])
  const [customPronouns, setCustomPronouns] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [height, setHeight] = useState(170)
  const [eyes, setEyes] = useState(null)
  const [gender, setGender] = useState(0.5)
  const [genderEvery, setGenderEvery] = useState(false)
  const [attraction, setAttraction] = useState([0.2, 0.8])
  const [saving, setSaving] = useState(false)

  const age = birthdate ? ageOf(birthdate) : null
  const everyone = attraction[0] <= 0.03 && attraction[1] >= 0.97
  const valid = name.trim() && age >= 18

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    await saveProfile({
      name: name.trim(),
      pronouns: [...pronouns, customPronouns.trim()].filter(Boolean),
      birthdate,
      height,
      eyes,
      gender: genderEvery ? 'every' : gender,
      attraction,
    })
    router.push('/virtues')
  }

  return (
    <form className="form-page" onSubmit={submit}>
      <Link href="/intro" className="back">←</Link>

      <h1>
        Hi, <span className="pink">{name.trim() || 'you'}</span>.
      </h1>
      <p className="lead">No boxes to tick. Just show us your colours.</p>

      <label className="field">
        <span className="field-label">01 · What do we call you?</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="given-name" />
      </label>

      <section className="field">
        <span className="field-label">02 · Your pronouns</span>
        <div className="chips">
          {PRONOUNS.map((p) => (
            <button
              key={p}
              type="button"
              className={`chip ${pronouns.includes(p) ? 'on' : ''}`}
              onClick={() => setPronouns(pronouns.includes(p) ? pronouns.filter((x) => x !== p) : [...pronouns, p])}
            >
              {p}
            </button>
          ))}
        </div>
        <input
          className="small"
          value={customPronouns}
          onChange={(e) => setCustomPronouns(e.target.value)}
          placeholder="…or write your own"
        />
      </section>

      <label className="field">
        <span className="field-label">03 · When did you land on Earth?</span>
        <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
        {age !== null && (
          <span className={`field-hint ${age < 18 ? 'error' : ''}`}>
            {age < 18 ? 'SyncItUp is 18+ only. Come back later!' : `${age} · ${signOf(birthdate)}`}
          </span>
        )}
      </label>

      <section className="field">
        <span className="field-label">04 · How tall?</span>
        <div className="height-readout">
          <strong>{height}</strong> cm <small>· {feetOf(height)}</small>
        </div>
        <input
          type="range"
          className="height-range"
          min="140"
          max="220"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          style={{ '--fill': `${((height - 140) / 80) * 100}%` }}
        />
      </section>

      <section className="field">
        <span className="field-label">05 · Eye colour</span>
        <p className="field-sub">Don't ask why. Just trust the process.</p>
        <div className="eyes">
          {EYES.map(([label, color]) => (
            <button key={label} type="button" className={`eye ${eyes === label ? 'on' : ''}`} onClick={() => setEyes(label)}>
              <span style={{ background: iris(color) }} />
              <small>{label === 'Heterochromia' ? 'Both ✨' : label}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="field">
        <span className="field-label">06 · Your gender, in colour</span>
        <p className="field-sub">Gender is a spectrum. Drag until it feels like you.</p>
        <Spectrum
          value={gender}
          every={genderEvery}
          onChange={(v) => {
            setGender(v)
            setGenderEvery(false)
          }}
          label="Your gender"
        />
        <div className="swatch-row">
          <span className={`swatch ${genderEvery ? 'rainbow' : ''}`} style={{ background: genderEvery ? RAINBOW : shade(gender) }} />
          <div>
            <strong>{genderEvery ? 'Every colour 🌈' : shadeName(gender)}</strong>
            <small>that's your shade</small>
          </div>
          <button type="button" className={`chip ${genderEvery ? 'on' : ''}`} onClick={() => setGenderEvery(!genderEvery)}>
            Every colour 🌈
          </button>
        </div>
      </section>

      <section className="field">
        <span className="field-label">07 · Who makes you vibe?</span>
        <p className="field-sub">Stretch the window over every shade you're into.</p>
        <Spectrum value={attraction} every={everyone} onChange={setAttraction} label="Your attraction" />
        <div className="swatch-row">
          <span
            className={`swatch ${everyone ? 'rainbow' : ''}`}
            style={{
              background: everyone ? RAINBOW : `linear-gradient(135deg, ${shade(attraction[0])}, ${shade(attraction[1])})`,
            }}
          />
          <div>
            <strong>{everyone ? 'Every colour 🌈' : `${shadeName(attraction[0])} → ${shadeName(attraction[1])}`}</strong>
            <small>your vibe range</small>
          </div>
          <button
            type="button"
            className={`chip ${everyone ? 'on' : ''}`}
            onClick={() => setAttraction(everyone ? [0.2, 0.8] : [0, 1])}
          >
            Every colour 🌈
          </button>
        </div>
      </section>

      <div className="cta-bar">
        <button className="cta" disabled={!valid || saving}>
          {saving ? 'Syncing…' : <>Yep, that's me! <span>→</span></>}
        </button>
      </div>
    </form>
  )
}
