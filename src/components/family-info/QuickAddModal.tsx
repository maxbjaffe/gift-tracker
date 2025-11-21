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
import { Mic, MicOff, Loader2, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ENTRY_TYPES = [
  { value: 'Insurance', icon: '🛡️', color: 'blue' },
  { value: 'Contact', icon: '📞', color: 'green' },
  { value: 'Financial', icon: '💰', color: 'purple' },
  { value: 'Healthcare', icon: '🏥', color: 'red' },
  { value: 'Education', icon: '🎓', color: 'yellow' },
  { value: 'Home', icon: '🏠', color: 'pink' },
  { value: 'Auto', icon: '🚗', color: 'orange' },
  { value: 'Legal', icon: '⚖️', color: 'gray' },
  { value: 'Other', icon: '📋', color: 'slate' },
];

const TEMPLATES: Record<string, { description: string; details: string; tags: string[] }> = {
  Insurance: {
    description: 'Policy information and coverage details',
    details: `## Policy Information
- **Policy Number**:
- **Provider**:
- **Agent/Contact**:
- **Phone**:
- **Email**:

## Coverage Details
- **Coverage Type**:
- **Deductible**:
- **Premium**:
- **Payment Schedule**:

## Important Dates
- **Renewal Date**:
- **Expiration**: `,
    tags: ['insurance'],
  },
  Contact: {
    description: 'Contact information for important people',
    details: `## Contact Information
- **Name**:
- **Relationship**:
- **Phone**:
- **Email**:
- **Address**:

## Notes
- **When to Contact**:
- **Important Info**: `,
    tags: ['contact'],
  },
  Financial: {
    description: 'Bank accounts, investments, or financial information',
    details: `## Account Information
- **Institution**:
- **Account Type**:
- **Account Number**: (last 4 digits)
- **Contact**:
- **Website**:

## Details
- **Purpose**:
- **Access Info**:
- **Auto-payments**: `,
    tags: ['financial'],
  },
  Healthcare: {
    description: 'Medical providers, prescriptions, or health information',
    details: `## Provider Information
- **Name**:
- **Specialty**:
- **Phone**:
- **Address**:
- **Website**:

## Details
- **Hours**:
- **Accepts Insurance**:
- **Notes**: `,
    tags: ['healthcare', 'medical'],
  },
  Education: {
    description: 'Schools, tutors, or educational resources',
    details: `## School/Program Information
- **Name**:
- **Address**:
- **Phone**:
- **Contact Person**:
- **Website**:

## Details
- **Hours**:
- **Important Dates**:
- **Notes**: `,
    tags: ['education', 'school'],
  },
  Home: {
    description: 'Utilities, warranties, or home-related information',
    details: `## Service Information
- **Provider**:
- **Account Number**:
- **Contact**:
- **Phone**:

## Details
- **Service Type**:
- **Monthly Cost**:
- **Renewal/Warranty**:
- **Notes**: `,
    tags: ['home'],
  },
  Auto: {
    description: 'Vehicle information, registration, or maintenance',
    details: `## Vehicle Information
- **Make/Model**:
- **Year**:
- **VIN**:
- **License Plate**:

## Details
- **Registration Expiration**:
- **Last Service**:
- **Mileage**:
- **Notes**: `,
    tags: ['auto', 'vehicle'],
  },
  Legal: {
    description: 'Legal documents, wills, or important legal information',
    details: `## Document Information
- **Document Type**:
- **Location**:
- **Attorney/Contact**:
- **Phone**:

## Details
- **Last Updated**:
- **Review Date**:
- **Notes**: `,
    tags: ['legal', 'important'],
  },
  Other: {
    description: 'General family information',
    details: `## Information

Add your details here...`,
    tags: ['general'],
  },
};

export function QuickAddModal({ open, onOpenChange }: QuickAddModalProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [tags, setTags] = useState('');
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
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setDetails((prev) => prev + finalTranscript);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast.error('Speech recognition error. Please try again.');
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
      toast.info('Listening... Speak now');
    }
  };

  const selectType = (type: string) => {
    setSelectedType(type);
    const template = TEMPLATES[type];
    setDescription(template.description);
    setDetails(template.details);
    setTags(template.tags.join(', '));
  };

  const handleAiEnhance = async () => {
    if (!details.trim()) {
      toast.error('Please add some details first');
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
          description,
          details,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.enhancedDetails) {
          setDetails(data.enhancedDetails);
          toast.success('Details enhanced with AI!');
        }
        if (data.suggestedTags) {
          const existingTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
          const newTags = [...new Set([...existingTags, ...data.suggestedTags])];
          setTags(newTags.join(', '));
        }
      } else {
        toast.error('Failed to enhance with AI');
      }
    } catch (error) {
      console.error('AI enhance error:', error);
      toast.error('Failed to enhance with AI');
    } finally {
      setAiEnhancing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedType || !title.trim()) {
      toast.error('Please select a type and enter a title');
      return;
    }

    setSaving(true);
    try {
      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const response = await fetch('/api/family-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type: selectedType,
          description,
          details,
          tags: tagsArray,
          status: 'active',
          security_level: 'private',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Entry created successfully!');
        onOpenChange(false);
        router.push(`/family-info/${data.entry.id}`);
        // Reset form
        setSelectedType('');
        setTitle('');
        setDescription('');
        setDetails('');
        setTags('');
      } else {
        toast.error(data.error || 'Failed to create entry');
      }
    } catch (error) {
      console.error('Error creating entry:', error);
      toast.error('Failed to create entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Quick Add Family Information
          </DialogTitle>
          <DialogDescription>
            Choose a type and fill in the details. Use templates for faster entry!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Type Selection */}
          {!selectedType ? (
            <div>
              <Label className="text-base font-semibold mb-3 block">
                What type of information are you adding?
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {ENTRY_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => selectType(type.value)}
                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-center group"
                  >
                    <div className="text-4xl mb-2">{type.icon}</div>
                    <div className="font-semibold text-sm">{type.value}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Selected Type Badge */}
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg border-2 border-purple-300 font-semibold flex items-center gap-2">
                  <span className="text-2xl">
                    {ENTRY_TYPES.find((t) => t.value === selectedType)?.icon}
                  </span>
                  {selectedType}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedType('')}
                >
                  Change Type
                </Button>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="quick-title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quick-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., State Farm Auto Insurance"
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="quick-description">Brief Description</Label>
                <Input
                  id="quick-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short summary"
                  className="mt-1"
                />
              </div>

              {/* Details with Voice Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="quick-details">Details (Markdown supported)</Label>
                  <div className="flex gap-2">
                    {recognition && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={toggleRecording}
                        className={isRecording ? 'bg-red-50 border-red-300' : ''}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="h-4 w-4 mr-1 text-red-600" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4 mr-1" />
                            Dictate
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAiEnhance}
                      disabled={aiEnhancing || !details.trim()}
                    >
                      {aiEnhancing ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-1" />
                      )}
                      AI Enhance
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="quick-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                  placeholder="Add detailed information here..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isRecording && (
                    <span className="text-red-600 font-semibold animate-pulse">
                      🎤 Recording...
                    </span>
                  )}
                </p>
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="quick-tags">Tags</Label>
                <Input
                  id="quick-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !title.trim()}
                  className="flex-1"
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
