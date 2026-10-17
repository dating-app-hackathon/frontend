// Voice layer for the interview. The UI only talks to `voice`, so the engine
// behind it can be swapped without touching any page.
//
// Every provider implements:
//   speak(text)            -> Promise, resolves when it's done talking
//   listen()               -> Promise<string>, the transcript of the answer
//   stop()                 -> cuts off whatever is happening
//
// Pick one with NEXT_PUBLIC_VOICE in .env.local: 'browser' (default) or 'local'.

import browser from './browser'
import local from './local'

const providers = { browser, local }

export const voice = providers[process.env.NEXT_PUBLIC_VOICE] ?? browser
