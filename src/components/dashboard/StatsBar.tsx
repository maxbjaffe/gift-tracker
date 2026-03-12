'use client'

import type { DashboardStats } from '@/lib/dashboard/occasion-data'

interface StatsBarProps {
  stats: DashboardStats
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: 'Due This Week', value: stats.dueThisWeek, color: 'text-blue-600' },
    { label: 'Gifts Needed', value: stats.giftsNeeded, color: 'text-orange-500' },
    { label: 'On Hand', value: stats.onHand, color: 'text-emerald-600' },
    { label: 'Budget Spent', value: `$${stats.budgetSpent.toFixed(0)}`, color: 'text-gray-600' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white/60 rounded-2xl shadow-sm p-3 text-center"
        >
          <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5">{item.label}</p>
        </div>
      ))}
    </div>
  )
}
