'use client'

import { useRef, useState, useCallback } from 'react'

const HR_QUESTIONS = [
  "Hi! I'm so glad you're here. Let's start simple — what's something you're genuinely passionate about?",
  "That's great to hear. What does a perfect weekend look like for you?",
  "Nice. How would your friends describe your personality in three words?",
  "Interesting! What's something that instantly makes you trust someone?",
  "Got it. And what are you hoping to find here — something casual, or something more serious?",
  "Thanks so much for sharing all of that with me — that's everything I needed!",
]

export function useHRConversation() {
  const [state, setState] = useState('idle') // idle | speaking | listening | thinking
  const [transcript, setTranscript] = useState('')
  const [aiText, setAiText] = useState('')
  const indexRef = useRef(0)

  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      setState('speaking')
      setAiText(text)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = resolve
      window.speechSynthesis.speak(utterance)
    })
  }, [])

  const listen = useCallback(() => {
    return new Promise((resolve) => {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognitionAPI) {
        resolve('(speech recognition not supported in this browser)')
        return
      }

      const recognition = new SpeechRecognitionAPI()
      recognition.lang = 'en-US'
      recognition.interimResults = true

      let finalText = ''
      recognition.onresult = (event) => {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript
          event.results[i].isFinal ? (finalText += text) : (interim += text)
        }
        setTranscript(finalText || interim)
      }

      recognition.onend = () => resolve(finalText.trim() || '(no response detected)')

      setState('listening')
      setTranscript('')
      recognition.start()
    })
  }, [])

  const runTurn = useCallback(async () => {
    const question = HR_QUESTIONS[indexRef.current]
    await speak(question)

    const isLast = indexRef.current === HR_QUESTIONS.length - 1
    if (isLast) {
      setState('idle')
      return
    }

    await listen()
    indexRef.current += 1
    runTurn()
  }, [speak, listen])

  const start = useCallback(() => {
    indexRef.current = 0
    runTurn()
  }, [runTurn])

  return { state, transcript, aiText, start }
}
