'use client'

import { useEffect, useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import * as poseDetection from '@tensorflow-models/pose-detection'

export default function BodyScanCamera({ active, onPoseUpdate }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const detectorRef = useRef(null)
  const rafRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const [dims, setDims] = useState({ width: 360, height: 480 })

  useEffect(() => {
    if (!active) return
    let stream
    let cancelled = false

    async function setup() {
      try {
        console.log('[BodyScan] requesting camera…')
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 360 }, height: { ideal: 480 } },
        })
        if (cancelled) return

        const video = videoRef.current
        video.srcObject = stream

        await new Promise((resolve) => {
          video.onloadedmetadata = () => resolve()
        })
        await video.play()

        // Match canvas size to the ACTUAL camera resolution (not the requested one)
        const actualWidth = video.videoWidth
        const actualHeight = video.videoHeight
        console.log('[BodyScan] actual video resolution:', actualWidth, actualHeight)
        setDims({ width: actualWidth, height: actualHeight })

        console.log('[BodyScan] loading WebGL backend…')
        await tf.setBackend('webgl')
        await tf.ready()
        console.log('[BodyScan] backend ready:', tf.getBackend())

        console.log('[BodyScan] loading MoveNet model…')
        detectorRef.current = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        )
        console.log('[BodyScan] model loaded ✅')

        setReady(true)
        detectLoop()
      } catch (err) {
        console.error('[BodyScan] setup failed:', err)
        setError(`Camera/model error: ${err.message}`)
      }
    }

    async function detectLoop() {
      if (cancelled || !detectorRef.current || !videoRef.current) return

      if (videoRef.current.readyState === 4) {
        const poses = await detectorRef.current.estimatePoses(videoRef.current)
        drawPose(poses[0])
        onPoseUpdate?.(poses[0])
      }
      rafRef.current = requestAnimationFrame(detectLoop)
    }

    function drawPose(pose) {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (!pose) return

      pose.keypoints.forEach((kp) => {
        if (kp.score > 0.3) {
          ctx.beginPath()
          ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI)
          ctx.fillStyle = '#00ff88'
          ctx.fill()
        }
      })

      const pairs = poseDetection.util.getAdjacentPairs(
        poseDetection.SupportedModels.MoveNet
      )
      pairs.forEach(([i, j]) => {
        const kp1 = pose.keypoints[i]
        const kp2 = pose.keypoints[j]
        if (kp1.score > 0.3 && kp2.score > 0.3) {
          ctx.beginPath()
          ctx.moveTo(kp1.x, kp1.y)
          ctx.lineTo(kp2.x, kp2.y)
          ctx.strokeStyle = '#00ff88'
          ctx.lineWidth = 3
          ctx.stroke()
        }
      })
    }

    setup()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [active, onPoseUpdate])

  return (
    <div
      style={{
        position: 'relative',
        width: dims.width,
        height: dims.height,
        margin: '0 auto',
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '10px',
          background: '#000',
        }}
      />
      <canvas
        ref={canvasRef}
        width={dims.width}
        height={dims.height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
      {!ready && !error && (
        <p style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 12, color: '#999' }}>
          Loading pose model…
        </p>
      )}
      {error && (
        <p style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 12, color: '#ff5555' }}>
          {error}
        </p>
      )}
    </div>
  )
}
