'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/ui/input-field'
import { Mail } from 'lucide-react'

interface UnclaimGiftModalProps {
  isOpen: boolean
  onClose: () => void
  giftName: string
  giftRecipientId: string
  claimedByEmail: string | null
  onUnclaim: (giftRecipientId: string, email: string | null) => Promise<void>
}

export function UnclaimGiftModal({
  isOpen,
  onClose,
  giftName,
  giftRecipientId,
  claimedByEmail,
  onUnclaim,
}: UnclaimGiftModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const requiresEmail = !!claimedByEmail

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (requiresEmail && !email.trim()) {
      setError('Please enter the email you used when reserving')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onUnclaim(giftRecipientId, requiresEmail ? email.trim() : null)
      setEmail('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unreserve gift')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Unreserve "{giftName}"</DialogTitle>
            <DialogDescription>
              {requiresEmail
                ? 'Enter the email you used when reserving this gift to confirm.'
                : 'Are you sure you want to unreserve this gift? It will become available for others.'}
            </DialogDescription>
          </DialogHeader>

          {requiresEmail && (
            <div className="my-6">
              <InputField
                label="Your Email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-4 w-4" />}
                error={error}
                required
                autoFocus
              />
            </div>
          )}

          {!requiresEmail && error && (
            <p className="text-sm text-red-600 my-4">{error}</p>
          )}

          <DialogFooter className="gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant="destructive"
            >
              {loading ? 'Unreserving...' : 'Confirm Unreserve'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
