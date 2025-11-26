import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  icon?: React.ReactNode
  inputSize?: 'sm' | 'md' | 'lg'
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, label, helperText, error, icon, inputSize = 'md', id, ...props }, ref) => {
    const inputId = id || `input-${React.useId()}`

    const sizeClasses = {
      sm: 'h-button-sm px-3 text-sm',
      md: 'h-button-md px-4',
      lg: 'h-button-lg px-5 text-lg',
    }

    return (
      <div className="w-full">
        {label && (
          <Label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </Label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'flex w-full rounded-lg border border-gray-300 bg-white',
              'focus:ring-2 focus:ring-giftstash-orange focus:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all',
              sizeClasses[inputSize],
              icon && 'pl-10',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {(helperText || error) && (
          <p className={cn('mt-2 text-sm', error ? 'text-red-600' : 'text-gray-500')}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)
InputField.displayName = 'InputField'

export { InputField }
