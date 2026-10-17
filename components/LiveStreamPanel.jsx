'use client'

import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'

export default function LiveStreamPanel() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const audioCanvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)

  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [emotion, setEmotion] = useState(null)
  const [gaze, setGaze] = useState(null)
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
      const MODEL_URL = '/models'
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
          ctx.strokeStyle = '#00ff88'
          ctx.lineWidth = 2
          ctx.strokeRect(x, y, width, height)
          ctx.fillStyle = '#00ff88'
          ctx.font = '14px sans-serif'
          ctx.fillText(
            `${label} (${Math.round(score * 100)}%)`,
            x,
            y > 20 ? y - 6 : y + height + 16
          )
        }
      } else {
        setEmotion(null)
      }
    }, 500)

    return () => clearInterval(intervalId)
  }, [modelsLoaded])

  // 4. Eye tracking with WebGazer (dynamic import — client only)
  useEffect(() => {
    let gazer

    async function startGaze() {
      const mod = await import('webgazer')
      gazer = mod.default

      gazer
        .setGazeListener((data) => {
          if (data) setGaze({ x: Math.round(data.x), y: Math.round(data.y) })
        })
        .showVideo(false)
        .showFaceOverlay(false)
        .showFaceFeedbackBox(false)
        .showPredictionPoints(false)

      await gazer.begin()
    }

    startGaze()

    return () => gazer?.end()
  }, [])

  // 5. Audio visualization
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

      const barWidth = (width / bufferLength) * 2.5
      let x = 0
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height
        ctx.fillStyle = avg > 15 ? '#00ff88' : '#555'
        ctx.fillRect(x, height - barHeight, barWidth, barHeight)
        x += barWidth + 1
      }
    }

    draw()
  }

  return (
    <section className="iv-livestream">
        <div className="iv-livestream-row">
        <div className="iv-video-wrap">
            <video ref={videoRef} autoPlay muted playsInline className="iv-video" />
            <canvas ref={canvasRef} width={240} height={180} className="iv-overlay" />

            <div className="iv-status-list">
            <span className="iv-status-item">
                ● eye…{gaze ? ` (${gaze.x}, ${gaze.y})` : ''}
            </span>
            <span className="iv-status-item">
                ● {emotion ? emotion.label : 'detecting…'}
            </span>
            <span className="iv-status-item">
                ● {isSpeaking ? 'voice…' : 'mic idle'}
            </span>
            </div>

            {error && <p className="iv-error">{error}</p>}
        </div>

        <div className="iv-audio-wrap">
            <canvas ref={audioCanvasRef} width={200} height={50} className="iv-audio-canvas" />
        </div>
        </div>
    </section>
    )
}
