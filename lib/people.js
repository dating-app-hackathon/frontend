// Small helpers for showing people's details, shared by onboarding and the app.

const SIGNS = ['Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn']
const SIGN_CUTOFF = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22]

export function ageOf(date) {
  const b = new Date(date)
  const now = new Date()
  const hadBirthday = now.getMonth() > b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() >= b.getDate())
  return now.getFullYear() - b.getFullYear() - (hadBirthday ? 0 : 1)
}

export function signOf(date) {
  const [, m, d] = date.split('-').map(Number)
  return SIGNS[d < SIGN_CUTOFF[m - 1] ? m - 1 : m]
}

export const feetOf = (cm) => {
  const inches = Math.round(cm / 2.54)
  return `${Math.floor(inches / 12)}'${inches % 12}"`
}
