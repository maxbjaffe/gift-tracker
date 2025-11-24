'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Gift } from 'lucide-react'

interface OccasionSelectorProps {
  occasion?: string | null
  occasionDate?: string | null
  onChange: (occasion: string | null, occasionDate: string | null) => void
  recipientName?: string
}

export function OccasionSelector({
  occasion,
  occasionDate,
  onChange,
  recipientName
}: OccasionSelectorProps) {
  const [selectedOccasion, setSelectedOccasion] = useState(occasion || '')
  const [selectedDate, setSelectedDate] = useState(occasionDate || '')

  const handleOccasionChange = (value: string) => {
    const newOccasion = value === 'none' ? null : value
    setSelectedOccasion(value)
    onChange(newOccasion, selectedDate || null)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value || null
    setSelectedDate(e.target.value)
    onChange(selectedOccasion || null, newDate)
  }

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium flex items-center gap-2">
          <Gift className="h-4 w-4" />
          Occasion {recipientName && `for ${recipientName}`}
        </Label>
        <Select value={selectedOccasion} onValueChange={handleOccasionChange}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Select occasion (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-gray-500">No specific occasion</span>
            </SelectItem>
            <SelectItem value="birthday">🎂 Birthday</SelectItem>
            <SelectItem value="christmas">🎄 Christmas</SelectItem>
            <SelectItem value="hanukkah">🕎 Hanukkah</SelectItem>
            <SelectItem value="anniversary">💍 Anniversary</SelectItem>
            <SelectItem value="wedding">💒 Wedding</SelectItem>
            <SelectItem value="graduation">🎓 Graduation</SelectItem>
            <SelectItem value="baby_shower">👶 Baby Shower</SelectItem>
            <SelectItem value="valentines">💝 Valentine's Day</SelectItem>
            <SelectItem value="mothers_day">🌸 Mother's Day</SelectItem>
            <SelectItem value="fathers_day">👔 Father's Day</SelectItem>
            <SelectItem value="holiday">🎉 Holiday</SelectItem>
            <SelectItem value="just_because">✨ Just Because</SelectItem>
            <SelectItem value="other">🎁 Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedOccasion && selectedOccasion !== 'none' && (
        <div>
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Occasion Date (optional)
          </Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="mt-1.5"
            placeholder="Select date"
          />
        </div>
      )}
    </div>
  )
}
