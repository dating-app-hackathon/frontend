// Client helpers for the mock API routes in app/api.
export async function getLiveVibers() {
  const res = await fetch('/api/vibers')
  const { vibers } = await res.json()
  return vibers
}
