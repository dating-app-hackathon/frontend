// Mock syncs: people whose vibe lines up with yours.
import { SYNCS } from '@/lib/syncs'

export async function GET() {
  return Response.json({ syncs: SYNCS })
}
