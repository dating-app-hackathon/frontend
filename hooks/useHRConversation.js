'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { voice } from '@/lib/voice'

// Runs the interview: speak a question, listen to the answer, repeat.
// Questions come from /api/interview, voice from lib/voice.
export function useHRConversation() {
  const [state, setState] = useState('idle') // idle | speaking | listening | thinking | done
  const [aiText, setAiText] = useState('')
  const [step, setStep] = useState(0)
  const [total, setTotal] = useState(0)
  const [result, setResult] = useState(null)
  const runRef = useRef(0) // bumping this cancels the running conversation

  const stop = useCallback(() => {
    runRef.current++
    voice.stop()
    setState('idle')
    setAiText('')
  }, [])

  // Testing shortcut: end the conversation now and jump straight to a result
  const skip = useCallback(async () => {
    runRef.current++
    voice.stop()
    setState('thinking')
    const res = await fetch('/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: {} }),
    }).then((r) => r.json())
    setResult(res)
    setState('done')
  }, [])

  useEffect(() => () => {
    runRef.current++
    voice.stop()
  }, [])

  const start = useCallback(async () => {
    const run = ++runRef.current
    const alive = () => run === runRef.current

    setResult(null)
    setState('thinking')
    const { questions, outro } = await fetch('/api/interview').then((r) => r.json())
    setTotal(questions.length)

    const answers = {}
    for (const [i, q] of questions.entries()) {
      if (!alive()) return
      setStep(i)
      setAiText(q.text)
      setState('speaking')
      await voice.speak(q.text)

      if (!alive()) return
      setState('listening')
      answers[q.id] = await voice.listen()
      setState('thinking')
    }

    if (!alive()) return
    const res = await fetch('/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    }).then((r) => r.json())

    setStep(questions.length)
    setAiText(outro)
    setState('speaking')
    await voice.speak(outro)

    if (!alive()) return
    voice.stop() // let go of the mic
    setResult(res)
    setState('done')
  }, [])

  return { state, aiText, step, total, result, start, stop, skip }
}
