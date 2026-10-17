// Client helpers for the mock API routes in app/api.
export async function getLiveVibers() {
  const res = await fetch('/api/vibers')
  const { vibers } = await res.json()
  return vibers
}

export async function saveProfile(profile) {
  const res = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })
  return res.json()
}
