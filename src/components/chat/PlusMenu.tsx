'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Gift, Package, Lightbulb, RefreshCw, CalendarDays } from 'lucide-react'

interface PlusMenuProps {
  onInjectPrefix: (prefix: string) => void
}

const actions = [
  { label: 'Save a gift', icon: Gift, prefix: 'I want to save a gift idea: ' },
  { label: 'Check stash', icon: Package, prefix: "What gifts do I have on hand?" },
  { label: 'Gift ideas for...', icon: Lightbulb, prefix: 'Give me gift ideas for ' },
  { label: 'Update status', icon: RefreshCw, prefix: 'Update the status of ' },
  { label: "What's coming up?", icon: CalendarDays, prefix: "What occasions are coming up soon?" },
]

export function PlusMenu({ onInjectPrefix }: PlusMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
          open
            ? 'bg-orange-500 text-white rotate-45'
            : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600'
        }`}
      >
        <Plus className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute bottom-12 left-0 bg-white rounded-xl shadow-lg border border-gray-200 py-2 w-52 animate-in fade-in slide-in-from-bottom-2 duration-150 z-50">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => {
                  onInjectPrefix(action.prefix)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {action.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
