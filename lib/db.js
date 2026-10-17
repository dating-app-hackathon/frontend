// Fake database for the in-browser mock backend (lib/api.js). The app is a static
// site, so "the server" is each visitor's localStorage. Falls back to memory if
// storage is blocked (private mode etc.).

const KEY = 'syncitup'
let memory = { profile: {}, chats: {} }

export function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? memory
  } catch {
    return memory
  }
}

export function save(data) {
  memory = data
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {}
}

// load, change, save in one go
export function update(change) {
  const data = load()
  change(data)
  save(data)
  return data
}
