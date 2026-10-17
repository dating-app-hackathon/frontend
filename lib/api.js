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

export async function getProfile() {
  const { profile } = await fetch('/api/profile').then((r) => r.json())
  return profile
}

export async function getSyncs() {
  const { syncs } = await fetch('/api/syncs').then((r) => r.json())
  return syncs
}

export async function getChat(id) {
  return fetch(`/api/chat/${id}`).then((r) => r.json())
}

export async function sendMessage(id, text) {
  const res = await fetch(`/api/chat/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  return (await res.json()).reply
}

export async function getSyncStrength() {
  const { strength } = await fetch('/api/activity').then((r) => r.json())
  return strength
}

export async function logActivity(points) {
  const res = await fetch('/api/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points }),
  })
  return (await res.json()).strength
}
