// Utility functions for holiday calculations

export interface Holiday {
  name: string
  date: Date
  daysUntil: number
  emoji: string
  color: string
}

export function getUpcomingHolidays(daysAhead: number = 150): Holiday[] {
  const today = new Date()
  const currentYear = today.getFullYear()
  const nextYear = currentYear + 1

  // US holidays — major gift-giving + fun/goofy ones
  const holidayDefinitions = [
    // Major gift-giving holidays
    { name: "New Year's Day", month: 0, day: 1, emoji: '🎆', color: 'from-blue-600 to-purple-600' },
    { name: "Valentine's Day", month: 1, day: 14, emoji: '❤️', color: 'from-pink-500 to-red-500' },
    { name: "Easter", month: 3, day: 20, emoji: '🐣', color: 'from-yellow-400 to-pink-400' }, // Approx — varies yearly
    { name: "Mother's Day", month: 4, day: 11, emoji: '🌷', color: 'from-pink-500 to-purple-500' }, // 2nd Sunday in May (approx)
    { name: "Father's Day", month: 5, day: 15, emoji: '👔', color: 'from-blue-500 to-cyan-500' }, // 3rd Sunday in June (approx)
    { name: "Independence Day", month: 6, day: 4, emoji: '🇺🇸', color: 'from-red-500 to-blue-500' },
    { name: "Halloween", month: 9, day: 31, emoji: '🎃', color: 'from-orange-500 to-purple-600' },
    { name: "Thanksgiving", month: 10, day: 27, emoji: '🦃', color: 'from-orange-600 to-yellow-600' }, // 4th Thursday in Nov (approx)
    { name: "Christmas", month: 11, day: 25, emoji: '🎄', color: 'from-red-600 to-green-600' },
    { name: "New Year's Eve", month: 11, day: 31, emoji: '🥂', color: 'from-purple-500 to-yellow-500' },

    // Fun & goofy US holidays
    { name: "Groundhog Day", month: 1, day: 2, emoji: '🦫', color: 'from-amber-600 to-amber-400' },
    { name: "Galentine's Day", month: 1, day: 13, emoji: '👯‍♀️', color: 'from-pink-400 to-rose-400' },
    { name: "Presidents' Day", month: 1, day: 17, emoji: '🏛️', color: 'from-blue-700 to-red-600' }, // 3rd Monday Feb (approx)
    { name: "Pi Day", month: 2, day: 14, emoji: '🥧', color: 'from-amber-500 to-yellow-400' },
    { name: "St. Patrick's Day", month: 2, day: 17, emoji: '☘️', color: 'from-green-500 to-emerald-400' },
    { name: "April Fools' Day", month: 3, day: 1, emoji: '🃏', color: 'from-yellow-400 to-red-400' },
    { name: "Earth Day", month: 3, day: 22, emoji: '🌍', color: 'from-green-500 to-blue-500' },
    { name: "Star Wars Day", month: 4, day: 4, emoji: '⭐', color: 'from-yellow-400 to-gray-800' },
    { name: "Cinco de Mayo", month: 4, day: 5, emoji: '🌮', color: 'from-green-500 to-red-500' },
    { name: "National Donut Day", month: 5, day: 6, emoji: '🍩', color: 'from-pink-400 to-amber-400' }, // 1st Friday June (approx)
    { name: "National Ice Cream Day", month: 6, day: 20, emoji: '🍦', color: 'from-pink-300 to-blue-300' }, // 3rd Sunday July (approx)
    { name: "Friendship Day", month: 7, day: 3, emoji: '🤝', color: 'from-yellow-400 to-orange-400' }, // 1st Sunday Aug (approx)
    { name: "Back to School", month: 7, day: 25, emoji: '🎒', color: 'from-blue-500 to-yellow-500' }, // Late Aug (approx)
    { name: "Labor Day", month: 8, day: 1, emoji: '⚒️', color: 'from-blue-600 to-red-500' }, // 1st Monday Sep (approx)
    { name: "Talk Like a Pirate Day", month: 8, day: 19, emoji: '🏴‍☠️', color: 'from-gray-800 to-red-600' },
    { name: "National Taco Day", month: 9, day: 4, emoji: '🌮', color: 'from-yellow-500 to-orange-500' },
    { name: "Boss's Day", month: 9, day: 16, emoji: '💼', color: 'from-slate-600 to-blue-500' },
    { name: "Veterans Day", month: 10, day: 11, emoji: '🎖️', color: 'from-red-600 to-blue-700' },
    { name: "Black Friday", month: 10, day: 28, emoji: '🛍️', color: 'from-gray-900 to-red-600' }, // Day after Thanksgiving (approx)
    { name: "Cyber Monday", month: 11, day: 1, emoji: '💻', color: 'from-blue-500 to-cyan-400' }, // Monday after Thanksgiving (approx)
    { name: "Giving Tuesday", month: 11, day: 2, emoji: '💝', color: 'from-red-400 to-orange-400' }, // Tuesday after Thanksgiving (approx)
    { name: "Ugly Sweater Day", month: 11, day: 19, emoji: '🧶', color: 'from-red-500 to-green-500' }, // 3rd Friday Dec (approx)
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
