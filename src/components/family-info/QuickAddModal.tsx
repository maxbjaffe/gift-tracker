'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Loader2, Sparkles, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ENTRY_TYPES = [
  { value: 'Insurance', icon: '🛡️', color: 'blue', examples: 'Auto, Home, Health insurance' },
  { value: 'Contact', icon: '📞', color: 'green', examples: 'Doctors, Emergency contacts' },
  { value: 'Financial', icon: '💰', color: 'purple', examples: 'Bank accounts, Investments' },
  { value: 'Healthcare', icon: '🏥', color: 'red', examples: 'Providers, Prescriptions' },
  { value: 'Education', icon: '🎓', color: 'yellow', examples: 'Schools, Tutors' },
  { value: 'Home', icon: '🏠', color: 'pink', examples: 'Utilities, Warranties' },
  { value: 'Auto', icon: '🚗', color: 'orange', examples: 'Registration, Maintenance' },
  { value: 'Legal', icon: '⚖️', color: 'gray', examples: 'Wills, Legal documents' },
  { value: 'Other', icon: '📋', color: 'slate', examples: 'General information' },
];

const QUICK_TEMPLATES: Record<string, string> = {
  Insurance: `Policy #:
Provider:
Contact:
Coverage:
Renewal Date: `,
  Contact: `Name:
Phone:
Email:
Address:
Notes: `,
  Financial: `Institution:
Account #:
Contact:
Website: `,
  Healthcare: `Provider:
Phone:
Address:
Hours: `,
  Education: `School/Program:
Phone:
Address:
Contact: `,
  Home: `Service:
Provider:
Account #:
Contact: `,
  Auto: `Vehicle:
VIN:
License Plate:
Registration Exp: `,
  Legal: `Document Type:
Location:
Attorney:
Review Date: `,
  Other: ``,
};

export function QuickAddModal({ open, onOpenChange }: QuickAddModalProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [quickNotes, setQuickNotes] = useState('');
  const [details, setDetails] = useState('');
  const [tags, setTags] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setQuickNotes((prev) => prev + finalTranscript);
        }
      };

      recognitionInstance.onerror = () => {
        setIsRecording(false);
        toast.error('Speech recognition error');
      };

      recognitionInstance.onend = () => setIsRecording(false);
      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      toast.error('Speech recognition not supported');
      return;
    }
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
      setIsRecording(true);
      toast.info('🎤 Listening...');
    }
  };

  const selectType = (type: string) => {
    setSelectedType(type);
    setDetails(QUICK_TEMPLATES[type] || '');
    const typeObj = ENTRY_TYPES.find((t) => t.value === type);
    setTags(type.toLowerCase());
  };

  const handleAiEnhance = async () => {
    if (!quickNotes.trim()) {
      toast.error('Add some notes first');
      return;
    }

    setAiEnhancing(true);
    try {
      const response = await fetch('/api/family-info/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          title,
          description: quickNotes,
          details: quickNotes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.enhancedDetails) {
          setDetails(data.enhancedDetails);
          toast.success('✨ Enhanced with AI!');
          setShowAdvanced(true);
        }
        if (data.suggestedTags) {
          const existingTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
          const newTags = [...new Set([...existingTags, ...data.suggestedTags])];
          setTags(newTags.join(', '));
        }
      }
    } catch (error) {
      toast.error('AI enhance failed');
    } finally {
      setAiEnhancing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedType || !title.trim()) {
      toast.error('Please fill in type and title');
      return;
    }

    setSaving(true);
    try {
      const tagsArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
      const fullDetails = details || quickNotes;

      const response = await fetch('/api/family-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type: selectedType,
          description: quickNotes.slice(0, 200),
          details: fullDetails,
          tags: tagsArray,
          status: 'active',
          security_level: 'private',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('✅ Entry created!');
        onOpenChange(false);
        router.push(`/family-info/${data.entry.id}`);
        // Reset
        setSelectedType('');
        setTitle('');
        setQuickNotes('');
        setDetails('');
        setTags('');
        setShowAdvanced(false);
      } else {
        toast.error(data.error || 'Failed to create');
      }
    } catch (error) {
      toast.error('Failed to create entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Quick Add
          </DialogTitle>
          <DialogDescription>
            Fast entry for important family information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Type Selection */}
          {!selectedType ? (
            <div>
              <Label className="text-lg font-semibold mb-4 block">
                What are you adding?
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {ENTRY_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => selectType(type.value)}
                    className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-md transition-all text-center group hover:scale-105"
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="font-bold text-sm mb-1">{type.value}</div>
                    <div className="text-xs text-gray-500">{type.examples}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Type Badge */}
              <div className="flex items-center justify-between pb-4 border-b-2">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">
                    {ENTRY_TYPES.find((t) => t.value === selectedType)?.icon}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Adding {selectedType}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {ENTRY_TYPES.find((t) => t.value === selectedType)?.examples}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedType('')}
                  className="text-gray-500"
                >
                  Change
                </Button>
              </div>

              {/* Essential Fields */}
              <div className="space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1 w-1 bg-purple-600 rounded-full"></div>
                  <h3 className="font-bold text-sm uppercase tracking-wide text-purple-900">
                    Essential Info
                  </h3>
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="quick-title" className="text-sm font-semibold">
                    What is this? <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quick-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`e.g., State Farm Auto Insurance, Dr. Smith Pediatrician...`}
                    className="mt-1.5 text-base"
                    autoFocus
                  />
                </div>

                {/* Quick Notes */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="quick-notes" className="text-sm font-semibold">
                      Quick Notes
                    </Label>
                    <div className="flex gap-1.5">
                      {recognition && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={toggleRecording}
                          className={`h-8 ${isRecording ? 'bg-red-50 border-red-300 text-red-700' : ''}`}
                        >
                          {isRecording ? (
                            <>
                              <MicOff className="h-3.5 w-3.5 mr-1" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Mic className="h-3.5 w-3.5 mr-1" />
                              Speak
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAiEnhance}
                        disabled={aiEnhancing || !quickNotes.trim()}
                        className="h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                      >
                        {aiEnhancing ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5 mr-1" />
                        )}
                        AI Enhance
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id="quick-notes"
                    value={quickNotes}
                    onChange={(e) => setQuickNotes(e.target.value)}
                    rows={4}
                    placeholder="Type or speak the key information... Policy numbers, phone numbers, important dates, etc."
                    className="text-sm resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    Tip: Add key info here, then click AI Enhance to format it beautifully
                  </p>
                </div>
              </div>

              {/* Advanced/Optional Section */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Optional Details {!showAdvanced && '(expand for more fields)'}
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4 bg-gray-50 p-5 rounded-xl">
                    {/* Full Details */}
                    <div>
                      <Label htmlFor="quick-details" className="text-sm font-semibold">
                        Detailed Information
                      </Label>
                      <Textarea
                        id="quick-details"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        rows={8}
                        className="font-mono text-xs mt-1.5"
                        placeholder="Detailed information, policy numbers, addresses, etc..."
                      />
                      <p className="text-xs text-gray-500 mt-1.5">
                        Supports markdown formatting
                      </p>
                    </div>

                    {/* Tags */}
                    <div>
                      <Label htmlFor="quick-tags" className="text-sm font-semibold">
                        Tags
                      </Label>
                      <Input
                        id="quick-tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="insurance, important, annual-renewal..."
                        className="mt-1.5 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1.5">
                        Separate with commas
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !title.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Quick Save
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
