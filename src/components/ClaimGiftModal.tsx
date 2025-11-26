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
import { Mail, User } from 'lucide-react'

interface ClaimGiftModalProps {
  isOpen: boolean
  onClose: () => void
  giftName: string
  giftRecipientId: string
  onClaim: (giftRecipientId: string, name: string, email: string) => Promise<void>
}

export function ClaimGiftModal({
  isOpen,
  onClose,
  giftName,
  giftRecipientId,
  onClaim,
}: ClaimGiftModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onClaim(giftRecipientId, name.trim(), email.trim())
      // Reset form
      setName('')
      setEmail('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reserve gift')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Reserve "{giftName}"</DialogTitle>
            <DialogDescription>
              Enter your details to reserve this gift and prevent others from purchasing it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-6">
            <InputField
              label="Your Name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="h-4 w-4" />}
              error={error}
              required
              autoFocus
            />
            <InputField
              label="Email (Optional)"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              helperText="Provide your email to unreserve this gift later"
            />
          </div>

          <DialogFooter className="gap-2">
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
              className="bg-gradient-to-r from-giftstash-orange to-giftstash-blue"
            >
              {loading ? 'Reserving...' : 'Confirm Reservation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
