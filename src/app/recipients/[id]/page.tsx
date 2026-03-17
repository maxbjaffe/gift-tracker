'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import PersonalitySurveyModal from '@/components/PersonalitySurveyModal';
import ProfileSuggestionsModal from '@/components/ProfileSuggestionsModal';
import ChatDialog from '@/components/ChatDialog';
import AssignGiftsDialog from '@/components/AssignGiftsDialog';
import { BudgetTracker } from '@/components/BudgetTracker';
import { AssignedGiftsManager } from '@/components/AssignedGiftsManager';
import { ShareButton } from '@/components/ShareButton';
import { ExportPDFButton } from '@/components/ExportPDFButton';
import { PersonInfoCard } from '@/components/recipient/PersonInfoCard';
import { AutoRecommendations } from '@/components/recipient/AutoRecommendations';
import { createClient } from '@/lib/supabase/client';
import { formatAgeDisplay, formatBirthday } from '@/lib/utils/age';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, ExternalLink, Settings, MessageSquare, Sparkles } from 'lucide-react';
import { logger } from '@/lib/logger';
import { useProfileHub } from '@/lib/hooks/useProfileHub';
import type { ImportantDate } from '@/components/ImportantDates';
import type { Recipient } from '@/types/database.types';

export default function RecipientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(true);

  // Personality Survey State
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [surveyAnalyzing, setSurveyAnalyzing] = useState(false);
  const [profileSuggestions, setProfileSuggestions] = useState<any>(null);
  const [applyingSuggestions, setApplyingSuggestions] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);

  // Profile Hub data
  const { profile: profileHub, loading: profileHubLoading } = useProfileHub(
    params.id as string,
    recipient
  );

  useEffect(() => {
    if (params.id) fetchRecipient();
  }, [params.id]);

  const fetchRecipient = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('recipients')
        .select('*')
        .eq('id', params.id as string)
        .single();
      if (error) throw error;
      setRecipient(data);
    } catch (error) {
      logger.error('Error fetching recipient:', error);
    } finally {
      setLoading(false);
    }
  };

  // Personality Survey Handlers
  const handleSurveyComplete = async (responses: Record<string, any>) => {
    if (!recipient) return;
    setShowSurveyModal(false);
    setSurveyAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: recipient.id, surveyResponses: responses }),
      });
      if (!response.ok) throw new Error('Failed to analyze survey');
      const data = await response.json();
      setProfileSuggestions(data.suggestions);
      setSurveyAnalyzing(false);
      setShowSuggestionsModal(true);
    } catch (error) {
      logger.error('Error analyzing survey:', error);
      alert('Failed to analyze survey. Please try again.');
      setSurveyAnalyzing(false);
    }
  };

  const handleApplySuggestions = async (selectedSuggestions: any) => {
    if (!recipient) return;
    setApplyingSuggestions(true);
    try {
      const supabase = createClient();
      const updateData: any = {};
      const arrayFields = ['interests', 'hobbies', 'favorite_colors', 'favorite_brands', 'favorite_stores', 'gift_dos', 'gift_donts', 'restrictions', 'items_already_owned'];
      arrayFields.forEach(field => {
        if (selectedSuggestions[field]) {
          const existing = (recipient as any)[field] || [];
          updateData[field] = Array.from(new Set([...existing, ...selectedSuggestions[field]]));
        }
      });
      if (selectedSuggestions.gift_preferences) updateData.gift_preferences = selectedSuggestions.gift_preferences;
      if (selectedSuggestions.notes) {
        const existingNotes = recipient.notes || '';
        updateData.notes = existingNotes
          ? `${existingNotes}\n\n[AI Survey Update - ${new Date().toLocaleDateString()}]\n${selectedSuggestions.notes}`
          : selectedSuggestions.notes;
      }
      const { error } = await supabase.from('recipients').update(updateData).eq('id', recipient.id);
      if (error) throw error;
      await fetchRecipient();
      setShowSuggestionsModal(false);
      setApplyingSuggestions(false);
    } catch (error) {
      logger.error('Error applying suggestions:', error);
      alert('Failed to update profile. Please try again.');
      setApplyingSuggestions(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading recipient...</p>
        </div>
      </div>
    );
  }

  if (!recipient) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Recipient not found</p>
          <Link href="/recipients" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            &larr; Back to Recipients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Recipients', href: '/recipients' },
            { label: recipient.name, current: true },
          ]}
          className="mb-4"
        />

        {/* Header Card — full width */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              <Avatar
                type={(recipient.avatar_type as any) ?? undefined}
                data={recipient.avatar_data ?? undefined}
                background={recipient.avatar_background ?? undefined}
                name={recipient.name}
                size="xl"
                showBorder
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {recipient.name}
                </h1>
                <p className="text-sm text-gray-600">
                  {recipient.relationship} &bull; {formatAgeDisplay(recipient.birthday, recipient.age_range)}
                </p>
                {recipient.birthday && (
                  <p className="text-xs text-gray-500 mt-1">
                    Birthday: {formatBirthday(recipient.birthday)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-row gap-2 w-full sm:w-auto">
              {profileHub && (
                <a href={profileHub.profileHubUrl} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                  <Button variant="outline" className="w-full h-button-md" aria-label="Edit profile in Profile Hub">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </a>
              )}
              <Link href={`/recipients/${recipient.id}/edit`} className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full h-button-md" aria-label="Edit gift settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Gift Settings
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-button-md px-3" aria-label="More actions">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setShowSurveyModal(true)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Take Personality Survey
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} asChild>
                    <div className="flex items-center cursor-pointer">
                      <ShareButton recipient={recipient as any} onShareUpdated={() => fetchRecipient()} />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div className="flex items-center cursor-pointer">
                      <ExportPDFButton recipientId={recipient.id} recipientName={recipient.name} />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowChatDialog(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat for Gift Ideas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* 2-column layout: left (person info) + right (budget, gifts, AI recs) */}
        <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-6 space-y-6 lg:space-y-0">
          {/* Left column */}
          <div>
            <PersonInfoCard
              recipient={recipient}
              profileHub={profileHub}
              profileHubLoading={profileHubLoading}
              onDatesUpdate={(newDates) => setRecipient({ ...recipient, important_dates: newDates as any })}
            />
          </div>

          {/* Right column (sticky on desktop) */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Budget Summary */}
            <BudgetTracker recipient={recipient} />

            {/* Assigned Gifts */}
            <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Assigned Gifts</h2>
              <div className="flex gap-2 mb-3">
                <AssignGiftsDialog
                  recipientId={recipient.id}
                  recipientName={recipient.name}
                  onAssignmentComplete={() => {}}
                />
                <Link
                  href={`/gifts/new?recipient=${recipient.id}`}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium whitespace-nowrap"
                >
                  + Create Gift
                </Link>
              </div>
              <AssignedGiftsManager
                recipientId={recipient.id}
                recipientName={recipient.name}
                onUpdate={() => {}}
              />
            </div>

            {/* AI Recommendations (auto-loaded) */}
            <AutoRecommendations recipientId={recipient.id} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {recipient && (
        <PersonalitySurveyModal
          isOpen={showSurveyModal}
          onClose={() => setShowSurveyModal(false)}
          recipientId={recipient.id}
          recipientName={recipient.name}
          onComplete={handleSurveyComplete}
        />
      )}
      {recipient && profileSuggestions && (
        <ProfileSuggestionsModal
          isOpen={showSuggestionsModal}
          onClose={() => setShowSuggestionsModal(false)}
          recipientName={recipient.name}
          suggestions={profileSuggestions}
          onApply={handleApplySuggestions}
          isApplying={applyingSuggestions}
        />
      )}
      {recipient && (
        <ChatDialog
          recipientId={recipient.id}
          recipientName={recipient.name}
          open={showChatDialog}
          onOpenChange={setShowChatDialog}
        />
      )}

      {/* Analyzing Survey Loading Overlay */}
      {surveyAnalyzing && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Survey...</h3>
            <p className="text-gray-600">
              Our AI is reviewing the responses and generating personalized profile suggestions.
              This may take 10-20 seconds.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
