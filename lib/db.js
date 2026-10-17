// In-memory "database" for the mock API. Kept on globalThis so every route shares
// it and it survives hot reloads (it resets when the dev server restarts).
export const db = (globalThis.__syncitup ??= { profile: {} })
