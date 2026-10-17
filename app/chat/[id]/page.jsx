// The site is exported as static files, so every chat page is built ahead of time:
// one per sync. The chat itself is a client component.
import { SYNCS } from '@/lib/syncs'
import Chat from './Chat'

export const dynamicParams = false

export function generateStaticParams() {
  return SYNCS.map((s) => ({ id: s.id }))
}

export default function ChatPage() {
  return <Chat />
}
