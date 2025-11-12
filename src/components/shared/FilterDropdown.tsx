'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterDropdownProps {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: readonly string[] | string[]
  placeholder?: string
}

export function FilterDropdown({
  label,
  value,
  onValueChange,
  options,
  placeholder = 'All',
}: FilterDropdownProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              <span className="capitalize">{option}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
