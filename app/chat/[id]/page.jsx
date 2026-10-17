'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Avatar from '@/components/Avatar'
import { getChat, sendMessage } from '@/lib/api'
import '../../(app)/app.css'
import './chat.css'

export default function Chat() {
  const { id } = useParams()
  const [sync, setSync] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const bottom = useRef(null)

  useEffect(() => {
    getChat(id).then((d) => {
      setSync(d.sync ?? false)
      setMessages(d.messages ?? [])
    })
    if (location.hash === '#profile') setShowProfile(true) // deep link straight to the profile
  }, [id])

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  async function send(e) {
    e.preventDefault()
    const msg = text.trim()
    if (!msg) return
    setText('')
    setMessages((m) => [...m, { from: 'me', text: msg }])
    const reply = await sendMessage(id, msg)
    // pretend they're typing for a moment
    setTimeout(() => setTyping(true), 600)
    setTimeout(() => {
      setTyping(false)
      setMessages((m) => [...m, { from: 'them', text: reply }])
    }, 1800 + Math.random() * 1200)
  }

  if (sync === null) return <main className="chat" />
  if (!sync)
    return (
      <main className="chat chat-missing">
        <p>This sync doesn't exist (anymore?) 👻</p>
        <Link href="/syncs">Back to your syncs</Link>
      </main>
    )

  return (
    <main className="chat">
      <header className="chat-top">
        <Link href="/syncs" className="chat-back">←</Link>
        <button className="chat-person" onClick={() => setShowProfile(true)}>
          <Avatar hue={sync.shade} size={40} />
          <span className="chat-who">
            <strong>{sync.name}</strong>
            <small>
              {sync.sync}% in sync · tap for profile
            </small>
          </span>
        </button>
      </header>

      {showProfile && (
        <div className="chat-sheet-bg" onClick={() => setShowProfile(false)}>
          <section className="chat-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="chat-sheet-close" onClick={() => setShowProfile(false)} aria-label="Close">
              ✕
            </button>
            <div className="chat-sheet-head">
              <Avatar hue={sync.shade} size={84} />
              <h2>
                {sync.name}, {sync.age}
              </h2>
              <p>
                {sync.pronouns} · {sync.vibe[0]} {sync.vibe[1]}
              </p>
            </div>

            <h3 className="chat-sheet-label">Why you synced</h3>
            <p className="chat-sheet-why">{sync.why}</p>

            <h3 className="chat-sheet-label">You both</h3>
            <div className="app-chips">
              {sync.shared.map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
          </section>
        </div>
      )}

      <div className="chat-scroll">
        <section className="chat-why">
          <small>Why you synced</small>
          <p>{sync.why}</p>
          <div className="app-chips">
            {sync.shared.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
        </section>

        {messages.map((m, i) => (
          <p key={i} className={`bubble ${m.from}`}>
            {m.text}
          </p>
        ))}
        {typing && (
          <p className="bubble them typing">
            <i />
            <i />
            <i />
          </p>
        )}
        <div ref={bottom} />
      </div>

      <form className="chat-input" onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${sync.name}…`} enterKeyHint="send" />
        <button disabled={!text.trim()} aria-label="Send">
          ↑
        </button>
      </form>
    </main>
  )
}
