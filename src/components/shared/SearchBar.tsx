// src/components/shared/SearchBar.tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  debounceMs?: number
}

export function SearchBar({ 
  placeholder = 'Search...', 
  onSearch,
  debounceMs = 300 
}: SearchBarProps) {
  const [value, setValue] = useState('')
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const handleChange = (newValue: string) => {
    setValue(newValue)

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Set new timeout for debounced search
    const newTimeoutId = setTimeout(() => {
      onSearch(newValue)
    }, debounceMs)

    setTimeoutId(newTimeoutId)
  }

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}