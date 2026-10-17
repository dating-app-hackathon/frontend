// Talks with the browser's built-in speechSynthesis. Listening is the silent mic
// recorder in ./mic (the browser's SpeechRecognition beeps and shows popups).

import { listen, release } from './mic'

function speak(text) {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    // Chrome sometimes never fires onend, so don't wait forever
    const timeout = setTimeout(resolve, text.length * 90 + 2000)
    utterance.onend = utterance.onerror = () => {
      clearTimeout(timeout)
      resolve()
    }
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  })
}

function stop() {
  window.speechSynthesis?.cancel()
  release()
}

export default { speak, listen, stop }
