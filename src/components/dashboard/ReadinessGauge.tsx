'use client'

import type { ReadinessScore } from '@/lib/dashboard/readiness-score'

interface ReadinessGaugeProps {
  score: ReadinessScore
}

export function ReadinessGauge({ score }: ReadinessGaugeProps) {
  const radius = 70
  const strokeWidth = 14
  const cx = 90
  const cy = 85
  const circumference = Math.PI * radius
  const fillLength = (score.percentage / 100) * circumference
  const dashOffset = circumference - fillLength

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="105" viewBox="0 0 180 105">
        {/* Background arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={score.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out, stroke 0.3s' }}
        />
        {/* Covered count */}
        <text x={cx} y={cy - 18} textAnchor="middle" className="text-3xl font-bold" fill="#1F2937">
          {score.coveredCount}
        </text>
        {/* Label */}
        <text x={cx} y={cy} textAnchor="middle" className="text-[10px]" fill="#6B7280">
          covered
        </text>
      </svg>
      <p className="text-xs text-gray-500 -mt-1">
        {score.coveredCount} of {score.totalCount} occasions ready
      </p>
      {score.needsGiftsCount > 0 && (
        <p className="text-xs font-semibold text-orange-500 mt-1">
          {score.needsGiftsCount} gift{score.needsGiftsCount !== 1 ? 's' : ''} needed
        </p>
      )}
    </div>
  )
}
