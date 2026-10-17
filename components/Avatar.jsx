// Placeholder profile picture: a silhouette on the person's gender shade.
// No photos on SyncItUp, on purpose.

import { shade, RAINBOW } from '@/components/Spectrum'

export default function Avatar({ hue = 0, size = 56 }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: hue === 'every' ? RAINBOW : shade(hue) }}
    >
      <svg viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="9" r="4" />
        <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
      </svg>
    </span>
  )
}
