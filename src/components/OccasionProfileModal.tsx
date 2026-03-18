'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import {
  GENERIC_PROFILE_PRESETS,
  getPresetByType,
  resolveKeyDate,
  type GenericProfilePreset,
} from '@/lib/generic-profiles'

interface ExistingProfile {
  id: string
  name: string
  profile_type: string
  max_budget: number | null
  target_quantity: number | null
  notes: string | null
  interests: string[] | null
  gift_dos: string[] | null
  gift_donts: string[] | null
  important_dates: any
  relationship: string | null
}

interface OccasionProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  existingProfile?: ExistingProfile | null
}

export function OccasionProfileModal({
  isOpen,
  onClose,
  onSuccess,
  existingProfile = null,
}: OccasionProfileModalProps) {
  const [step, setStep] = useState<1 | 2>(existingProfile ? 2 : 1)
  const [selectedPreset, setSelectedPreset] = useState<GenericProfilePreset | null>(null)
  const [loading, setLoading] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [notes, setNotes] = useState('')

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (existingProfile) {
        const preset = getPresetByType(existingProfile.profile_type)
        setSelectedPreset(preset || null)
        setStep(2)
        setName(existingProfile.name || '')
        setBudget(existingProfile.max_budget?.toString() || '')
        setQuantity(existingProfile.target_quantity?.toString() || '1')
        setNotes(existingProfile.notes || '')
      } else {
        setStep(1)
        setSelectedPreset(null)
        setName('')
        setBudget('')
        setQuantity('1')
        setNotes('')
      }
    }
  }, [isOpen, existingProfile])

  function handlePresetSelect(preset: GenericProfilePreset) {
    setSelectedPreset(preset)
    setName(preset.defaultName)
    setBudget(preset.suggestedBudget.toString())
    setQuantity(preset.suggestedQuantity.toString())
    setNotes(preset.defaultNotes)
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !selectedPreset) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to continue')
        return
      }

      const resolvedDates = selectedPreset.keyDates.map(resolveKeyDate)

      const profileData = {
        user_id: user.id,
        name: name.trim(),
        profile_type: selectedPreset.type,
        relationship: selectedPreset.label,
        max_budget: budget ? parseFloat(budget) : null,
        target_quantity: quantity ? parseInt(quantity, 10) : 1,
        notes: notes.trim() || null,
        interests: selectedPreset.defaultInterests,
        gift_dos: selectedPreset.defaultGiftDos,
        gift_donts: selectedPreset.defaultGiftDonts,
        important_dates: resolvedDates,
        avatar_type: 'emoji',
        avatar_data: selectedPreset.emoji,
        avatar_background: selectedPreset.emojiBackground,
      }

      if (existingProfile?.id) {
        const { error } = await supabase
          .from('recipients')
          .update(profileData)
          .eq('id', existingProfile.id)
          .eq('user_id', user.id)
        if (error) throw error
        toast.success('Occasion profile updated')
      } else {
        const { error } = await supabase.from('recipients').insert(profileData)
        if (error) throw error
        toast.success('Occasion profile created')
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error saving occasion profile:', error)
      toast.error('Failed to save occasion profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle>Create Occasion Profile</DialogTitle>
              <DialogDescription>
                Pick a gift scenario to get started with smart defaults
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-2 mt-2">
              {GENERIC_PROFILE_PRESETS.map(preset => (
                <button
                  key={preset.type}
                  onClick={() => handlePresetSelect(preset)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all text-center group"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: preset.emojiBackground }}
                  >
                    {preset.emoji}
                  </div>
                  <span className="text-xs font-semibold text-gray-900 group-hover:text-purple-700 leading-tight">
                    {preset.label}
                  </span>
                  <span className="text-[10px] text-gray-500 leading-tight line-clamp-2">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {!existingProfile && (
                  <button
                    onClick={() => setStep(1)}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                {selectedPreset && (
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: selectedPreset.emojiBackground }}
                  >
                    {selectedPreset.emoji}
                  </span>
                )}
                {existingProfile ? 'Edit Occasion Profile' : `New ${selectedPreset?.label || 'Occasion'} Profile`}
              </DialogTitle>
              <DialogDescription>
                Customize the details for this gift scenario
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <Label htmlFor="occasion-name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="occasion-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Teacher Gift"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="occasion-budget">Budget per gift ($)</Label>
                <Input
                  id="occasion-budget"
                  type="number"
                  min="0"
                  step="5"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  placeholder="e.g., 30"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="occasion-quantity">Keep on hand</Label>
                <Input
                  id="occasion-quantity"
                  type="number"
                  min="1"
                  max="20"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  disabled={loading}
                />
                <p className="text-[11px] text-gray-500 mt-1">How many gifts to keep ready for this scenario</p>
              </div>

              <div>
                <Label htmlFor="occasion-notes">Notes</Label>
                <Textarea
                  id="occasion-notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Tips and context for this gift scenario"
                  rows={3}
                  disabled={loading}
                />
              </div>

              {/* Key dates preview */}
              {selectedPreset && selectedPreset.keyDates.length > 0 && (
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">Key Dates (auto-populated)</Label>
                  <div className="mt-1 space-y-1">
                    {selectedPreset.keyDates.map(kd => {
                      const resolved = resolveKeyDate(kd)
                      return (
                        <div key={kd.label} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-1.5">
                          <span className="font-medium text-gray-700">{kd.label}</span>
                          <span className="text-gray-500">
                            {new Date(resolved.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {kd.repeats && <span className="ml-1 text-gray-400">(yearly)</span>}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    existingProfile ? 'Update Profile' : 'Create Profile'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
