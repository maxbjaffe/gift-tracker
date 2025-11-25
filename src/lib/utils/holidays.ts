// Utility functions for holiday calculations

export interface Holiday {
  name: string
  date: Date
  daysUntil: number
  emoji: string
  color: string
}

export function getUpcomingHolidays(daysAhead: number = 90): Holiday[] {
  const today = new Date()
  const currentYear = today.getFullYear()
  const nextYear = currentYear + 1

  // Define major gift-giving holidays
  const holidayDefinitions = [
    { name: "Valentine's Day", month: 1, day: 14, emoji: '❤️', color: 'from-pink-500 to-red-500' },
    { name: "Mother's Day", month: 4, day: 14, emoji: '🌷', color: 'from-pink-500 to-purple-500' }, // Approx 2nd Sunday in May
    { name: "Father's Day", month: 5, day: 18, emoji: '👔', color: 'from-blue-500 to-cyan-500' }, // Approx 3rd Sunday in June
    { name: "Halloween", month: 9, day: 31, emoji: '🎃', color: 'from-orange-500 to-purple-600' },
    { name: "Thanksgiving", month: 10, day: 23, emoji: '🦃', color: 'from-orange-600 to-yellow-600' }, // Approx 4th Thursday in November
    { name: "Christmas", month: 11, day: 25, emoji: '🎄', color: 'from-red-600 to-green-600' },
    { name: "New Year's", month: 0, day: 1, emoji: '🎆', color: 'from-blue-600 to-purple-600' },
  ]

  const holidays: Holiday[] = []

  // Check each holiday for current and next year
  holidayDefinitions.forEach(holiday => {
    // Current year
    const thisYearDate = new Date(currentYear, holiday.month, holiday.day)
    const daysUntil = Math.ceil((thisYearDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil >= 0 && daysUntil <= daysAhead) {
      holidays.push({
        name: holiday.name,
        date: thisYearDate,
        daysUntil,
        emoji: holiday.emoji,
        color: holiday.color
      })
    }

    // Next year (for holidays that have passed this year)
    const nextYearDate = new Date(nextYear, holiday.month, holiday.day)
    const daysUntilNextYear = Math.ceil((nextYearDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilNextYear >= 0 && daysUntilNextYear <= daysAhead) {
      holidays.push({
        name: holiday.name,
        date: nextYearDate,
        daysUntil: daysUntilNextYear,
        emoji: holiday.emoji,
        color: holiday.color
      })
    }
  })

  // Sort by days until
  return holidays.sort((a, b) => a.daysUntil - b.daysUntil)
}
