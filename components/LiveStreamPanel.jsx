'use client'

import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'

const EMOJI = { happy: '😊', sad: '😢', angry: '😠', fearful: '😨', disgusted: '🤢', surprised: '😮', neutral: '😐' }

export default function LiveStreamPanel() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const audioCanvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)

  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [emotion, setEmotion] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState(null)

  // 1. Start webcam + mic
  useEffect(() => {
    let active = true

    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 240, height: 180 },
            audio: true,
        })
        if (!active) return
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setupAudioAnalyser(stream)
      } catch (err) {
        console.error('getUserMedia error:', err)
        setError('Camera/mic access denied or unavailable.')
      }
    }

    startMedia()

    return () => {
      active = false
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // 2. Load face-api models
  useEffect(() => {
    async function loadModels() {
      const MODEL_URL = `${process.env.NEXT_PUBLIC_BASE_PATH}/models` // served from public/models
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      setModelsLoaded(true)
    }
    loadModels()
  }, [])

  // 3. Emotion detection loop
  useEffect(() => {
    if (!modelsLoaded) return

    const intervalId = setInterval(async () => {
      const video = videoRef.current
      if (!video || video.readyState !== 4) return

      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions()

      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)

      if (detection) {
        const [label, score] = Object.entries(detection.expressions).sort(
          (a, b) => b[1] - a[1]
        )[0]
        setEmotion({ label, score })

        if (ctx) {
          const { x, y, width, height } = detection.detection.box
          ctx.strokeStyle = '#fd4269'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.roundRect(x, y, width, height, 16)
          ctx.stroke()
        }
      } else {
        setEmotion(null)
      }
    }, 500)

    return () => clearInterval(intervalId)
  }, [modelsLoaded])

  // 4. Audio visualization
  function setupAudioAnalyser(stream) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const source = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const canvas = audioCanvasRef.current

    function draw() {
      rafRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength
      setIsSpeaking(avg > 15)

      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      // mirrored bars from the centre, pink while you talk
      const bars = 32
      const barWidth = width / bars / 2 - 2
      ctx.fillStyle = avg > 15 ? '#fd4269' : '#ddd5d0'
      for (let i = 0; i < bars; i++) {
        const barHeight = Math.max(4, (dataArray[i * 2] / 255) * height)
        const y = (height - barHeight) / 2
        ctx.beginPath()
        ctx.roundRect(width / 2 + i * (barWidth + 2), y, barWidth, barHeight, 2)
        ctx.roundRect(width / 2 - (i + 1) * (barWidth + 2), y, barWidth, barHeight, 2)
        ctx.fill()
      }
    }

    draw()
  }

  return (
    <>
      <div className="iv-pip">
        <video ref={videoRef} autoPlay muted playsInline className="iv-video" />
        <canvas ref={canvasRef} width={240} height={180} className="iv-overlay" />
        {error && <p className="iv-error">{error}</p>}
      </div>

      <div className="iv-chips">
        <span className={emotion ? 'on' : ''}>
          {emotion ? `${EMOJI[emotion.label] ?? '🙂'} ${emotion.label}` : '🙂 reading you…'}
        </span>
        <span className={isSpeaking ? 'on' : ''}>🎙️ {isSpeaking ? 'hearing you' : 'mic on'}</span>
      </div>

      <canvas ref={audioCanvasRef} width={780} height={96} className="iv-wave" />
    </>
  )
}
