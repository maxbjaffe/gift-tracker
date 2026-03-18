'use client'

import { useState } from 'react'
import { CalendarPlus, X, Repeat, CalendarDays, Trash2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { parseLocalDate } from '@/lib/utils/age'

export interface ImportantDate {
  label: string
  date: string // YYYY-MM-DD
  repeats: boolean
}

const DATE_TYPE_OPTIONS = [
  'Anniversary',
  'Graduation',
  'First Day of School',
  'Last Day of School',
  'Wedding',
  'Engagement',
  'Retirement',
  'Baptism',
  'Bar/Bat Mitzvah',
  'Recital',
  'Sports Season Start',
  'Trip/Vacation',
  'Adoption Day',
  'Memorial',
  'Other',
]

interface ImportantDatesProps {
  recipientId: string
  dates: ImportantDate[]
  onUpdate: (dates: ImportantDate[]) => void
  readOnly?: boolean
  /** When true, renders without its own card wrapper (for embedding inside another card) */
  embedded?: boolean
}

export function ImportantDates({ recipientId, dates, onUpdate, readOnly = false, embedded = false }: ImportantDatesProps) {
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [date, setDate] = useState('')
  const [repeats, setRepeats] = useState(true)
  const [saving, setSaving] = useState(false)

  const effectiveLabel = label === 'Other' ? customLabel : label

  const save = async (newDates: ImportantDate[]) => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('recipients')
        .update({ important_dates: newDates as unknown as import('@/types/database.types').Json })
        .eq('id', recipientId)
      if (error) throw error
      onUpdate(newDates)
    } catch (err) {
      console.error('Failed to save dates:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = async () => {
    if (!effectiveLabel.trim() || !date) return
    const newDate: ImportantDate = {
      label: effectiveLabel.trim(),
      date,
      repeats,
    }
    await save([...dates, newDate])
    setAdding(false)
    setLabel('')
    setCustomLabel('')
    setDate('')
    setRepeats(true)
  }

  const handleRemove = async (index: number) => {
    const newDates = dates.filter((_, i) => i !== index)
    await save(newDates)
  }

  const formatDate = (dateStr: string) => {
    const d = parseLocalDate(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className={embedded ? '' : 'bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8'}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-gray-600" />
          <h2 className={embedded ? 'text-xs font-bold text-gray-900 uppercase tracking-wide' : 'text-lg md:text-xl font-bold text-gray-900'}>Important Dates</h2>
        </div>
        {!readOnly && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-xs md:text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Date
          </button>
        )}
      </div>

      {/* Existing dates */}
      {dates.length === 0 && !adding && (
        <p className="text-sm text-gray-400 italic">No important dates added yet</p>
      )}

      {dates.length > 0 && (
        <div className="space-y-2 mb-4">
          {dates.map((d, i) => (
            <div
              key={`${d.label}-${d.date}-${i}`}
              className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center flex-shrink-0">
                <CalendarPlus className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{d.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">{formatDate(d.date)}</span>
                  {d.repeats && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium flex items-center gap-0.5">
                      <Repeat className="w-2.5 h-2.5" /> Annual
                    </span>
                  )}
                </div>
              </div>
              {!readOnly && (
                <button
                  onClick={() => handleRemove(i)}
                  disabled={saving}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all disabled:opacity-50"
                  title="Remove date"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {adding && (
        <div className="border border-purple-200 rounded-xl p-4 bg-purple-50/30 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Type</label>
            <select
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select significance...</option>
              {DATE_TYPE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {label === 'Other' && (
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Custom label</label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="e.g., Dance recital"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={repeats}
              onChange={(e) => setRepeats(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Repeats annually</span>
          </label>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={!effectiveLabel.trim() || !date || saving}
              className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Date'}
            </button>
            <button
              onClick={() => { setAdding(false); setLabel(''); setCustomLabel(''); setDate(''); setRepeats(true) }}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
