// src/app/recipients/[id]/page.tsx - UPDATED to pass price_range and where_to_buy

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GiftStashNav } from '@/components/GiftStashNav';
import Avatar from '@/components/Avatar';
import PersonalitySurveyModal from '@/components/PersonalitySurveyModal';
import ProfileSuggestionsModal from '@/components/ProfileSuggestionsModal';
import ChatDialog from '@/components/ChatDialog';
import AssignGiftsDialog from '@/components/AssignGiftsDialog';
import { BudgetTracker } from '@/components/BudgetTracker';
import { AssignedGiftsManager } from '@/components/AssignedGiftsManager';
import { ShareButton } from '@/components/ShareButton';
import { ExportPDFButton } from '@/components/ExportPDFButton';
import { createClient } from '@/lib/supabase/client';
import { formatAgeDisplay } from '@/lib/utils/age';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Share2, FileDown, MessageSquare, Sparkles } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Recipient {
  id: string;
  name: string;
  relationship: string;
  birthday: string;
  age_range: string;
  interests: string;
  gift_preferences: string;
  favorite_stores: string;
  favorite_brands: string;
  restrictions: string;
  wishlist_items: string;
  max_budget: number;
  notes: string;
  avatar_type?: 'ai' | 'emoji' | 'initials' | 'photo' | null;
  avatar_data?: string | null;
  avatar_background?: string | null;
  share_token?: string | null;
  share_privacy?: string | null;
  share_enabled?: boolean | null;
  share_expires_at?: string | null;
  share_view_count?: number | null;
}

interface Gift {
  id: string;
  name: string;
  price: number;
  store: string;
  brand: string;
  status: string;
}

interface Recommendation {
  title: string;
  description: string;
  price_range: string;      // e.g. "$120-$160"
  reasoning: string;
  where_to_buy: string;     // e.g. "LEGO Store, Amazon"
  category: string;
  image_url?: string;
  amazon_link?: string;
  google_shopping_link?: string;
}

export default function RecipientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [assignedGifts, setAssignedGifts] = useState<Gift[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [processingFeedback, setProcessingFeedback] = useState<string | null>(null);

  // Filter state for AI recommendations
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Personality Survey State
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [surveyAnalyzing, setSurveyAnalyzing] = useState(false);
  const [profileSuggestions, setProfileSuggestions] = useState<any>(null);
  const [applyingSuggestions, setApplyingSuggestions] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchRecipient();
      fetchAssignedGifts();
    }
  }, [params.id]);

  const fetchRecipient = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('recipients')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        logger.error('Error fetching recipient:', error);
        throw error;
      }

      setRecipient(data);
    } catch (error) {
      logger.error('Error fetching recipient:', error);
      alert('Failed to load recipient');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedGifts = async () => {
    try {
      const response = await fetch(`/api/gifts?recipient_id=${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch gifts');
      const data = await response.json();
      setAssignedGifts(data);
    } catch (error) {
      logger.error('Error fetching assigned gifts:', error);
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
        body: JSON.stringify({
          recipientId: recipient.id,
          surveyResponses: responses
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze survey');
      }

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

      // Merge selected suggestions with existing profile intelligently
      const updateData: any = {};

      // For arrays: merge without duplicates
      const arrayFields = ['interests', 'hobbies', 'favorite_colors', 'favorite_brands', 'favorite_stores', 'gift_dos', 'gift_donts', 'restrictions', 'items_already_owned'];
      arrayFields.forEach(field => {
        if (selectedSuggestions[field]) {
          const existing = (recipient as any)[field] || [];
          const newItems = selectedSuggestions[field];
          // Merge and deduplicate
          updateData[field] = Array.from(new Set([...existing, ...newItems]));
        }
      });

      // For text fields: append or replace intelligently
      if (selectedSuggestions.gift_preferences) {
        updateData.gift_preferences = selectedSuggestions.gift_preferences;
      }
      if (selectedSuggestions.notes) {
        // Append to existing notes
        const existingNotes = recipient.notes || '';
        updateData.notes = existingNotes
          ? `${existingNotes}\n\n[AI Survey Update - ${new Date().toLocaleDateString()}]\n${selectedSuggestions.notes}`
          : selectedSuggestions.notes;
      }

      // Update recipient in database
      const { error } = await supabase
        .from('recipients')
        .update(updateData)
        .eq('id', recipient.id);

      if (error) throw error;

      // Refresh recipient data
      await fetchRecipient();

      setShowSuggestionsModal(false);
      setApplyingSuggestions(false);
    } catch (error) {
      logger.error('Error applying suggestions:', error);
      alert('Failed to update profile. Please try again.');
      setApplyingSuggestions(false);
    }
  };

  const generateRecommendations = async () => {
    if (!recipient) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: recipient.id,
          category: category || null,
          minPrice: minPrice ? parseFloat(minPrice) : null,
          maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        })
      });

      if (!response.ok) throw new Error('Failed to generate recommendations');
      
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      logger.error('Error generating recommendations:', error);
      alert('Failed to generate recommendations');
    } finally {
      setGenerating(false);
    }
  };

  const handleFeedback = async (
    recommendation: Recommendation, 
    feedbackType: 'added' | 'liked' | 'rejected' | 'already_have'
  ) => {
    setProcessingFeedback(recommendation.title);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: recipient?.id,
          recommendation_name: recommendation.title,
          recommendation_description: recommendation.description,
          price_range: recommendation.price_range,
          where_to_buy: recommendation.where_to_buy,
          image_url: recommendation.image_url,
          amazon_link: recommendation.amazon_link,
          google_shopping_link: recommendation.google_shopping_link,
          feedback_type: feedbackType,
        })
      });

      if (!response.ok) throw new Error('Failed to record feedback');

      const result = await response.json();

      // Log debug info if available
      if (result.debug) {
        logger.log('Price extraction debug:', result.debug);
      }

      // Remove recommendation from list
      setRecommendations(prev => 
        prev.filter(r => r.title !== recommendation.title)
      );

      // If added, refresh the gifts list
      if (feedbackType === 'added') {
        await fetchAssignedGifts();
      }

    } catch (error) {
      logger.error('Error recording feedback:', error);
      alert('Failed to record feedback');
    } finally {
      setProcessingFeedback(null);
    }
  };

  if (loading) {
    return (
      <>
        <GiftStashNav />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-sm md:text-base text-gray-600">Loading recipient...</p>
          </div>
        </div>
      </>
    );
  }

  if (!recipient) {
    return (
      <>
        <GiftStashNav />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-lg md:text-xl text-gray-600 mb-4">Recipient not found</p>
            <Link
              href="/recipients"
              className="text-sm md:text-base text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Recipients
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GiftStashNav />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6 lg:p-8">
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

        {/* Header */}
        <div className="mb-6 md:mb-8 space-y-4 md:space-y-6">

          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 w-full md:w-auto">
                <Avatar
                  type={recipient.avatar_type ?? undefined}
                  data={recipient.avatar_data ?? undefined}
                  background={recipient.avatar_background ?? undefined}
                  name={recipient.name}
                  size="xl"
                  showBorder
                />
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {recipient.name}
                  </h1>
                  <p className="text-sm md:text-base lg:text-lg text-gray-600">
                    {recipient.relationship} • {formatAgeDisplay(recipient.birthday, recipient.age_range)}
                  </p>
                  {recipient.birthday && (
                    <p className="text-xs md:text-sm text-gray-500 mt-2">
                      🎂 Birthday: {new Date(recipient.birthday).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-row gap-2 w-full sm:w-auto">
                <Link href={`/recipients/${recipient.id}/edit`} className="flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    className="w-full h-button-md"
                    aria-label="Edit recipient profile"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-button-md px-3"
                      aria-label="More actions"
                    >
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
                        <ShareButton
                          recipient={recipient as any}
                          onShareUpdated={() => fetchRecipient()}
                        />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <div className="flex items-center cursor-pointer">
                        <ExportPDFButton
                          recipientId={recipient.id}
                          recipientName={recipient.name}
                        />
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

            {/* Quick Info */}
            <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {recipient.interests && (
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-700 mb-2">Interests</h3>
                  <p className="text-sm md:text-base text-gray-600">{recipient.interests}</p>
                </div>
              )}
              {recipient.max_budget && (
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-700 mb-2">Max Budget</h3>
                  <p className="text-xl md:text-2xl font-bold text-green-600">
                    ${recipient.max_budget.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assigned Gifts Section - New Component with Per-Recipient Purchase Tracking */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <AssignGiftsDialog
              recipientId={recipient.id}
              recipientName={recipient.name}
              onAssignmentComplete={() => {
                fetchAssignedGifts();
              }}
            />
            <Link
              href={`/gifts/new?recipient=${recipient.id}`}
              className="w-full sm:w-auto px-4 h-11 md:h-12 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center text-sm md:text-base whitespace-nowrap"
            >
              + Create Gift
            </Link>
          </div>
          <AssignedGiftsManager
            recipientId={recipient.id}
            recipientName={recipient.name}
            onUpdate={() => {
              fetchAssignedGifts();
            }}
          />
        </div>

        {/* Budget Tracking Section */}
        <div className="mb-6 md:mb-8">
          <BudgetTracker recipient={recipient} />
        </div>

        {/* AI Recommendations Section */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
            🤖 AI Gift Recommendations
          </h2>

          {/* Filter Inputs */}
          <div className="mb-4 md:mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category (optional)
                </label>
                <input
                  id="category"
                  type="text"
                  placeholder="e.g., Toys, Books, Electronics"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={generating}
                  className="w-full min-h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500">$</span>
                  <input
                    id="minPrice"
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    disabled={generating}
                    className="w-full min-h-11 pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500">$</span>
                  <input
                    id="maxPrice"
                    type="number"
                    placeholder="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    disabled={generating}
                    className="w-full min-h-11 pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={generateRecommendations}
              disabled={generating}
              className="w-full px-4 md:px-6 h-11 md:h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm md:text-base flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <span className="inline-block animate-spin">⚡</span>
                  Generating...
                </>
              ) : (
                <>✨ Generate Ideas</>
              )}
            </button>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-8 md:py-12 text-gray-500">
              <p className="text-base md:text-lg mb-2">No recommendations yet</p>
              <p className="text-xs md:text-sm">Click "Generate Ideas" to get AI-powered gift suggestions!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {(recommendations || []).map((rec, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-200 rounded-xl p-3 hover:border-purple-300 transition-all flex flex-col h-full"
                >
                  {/* Image */}
                  {rec.image_url && (
                    <div className="mb-3 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={rec.image_url}
                        alt={rec.title}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}

                  {/* Title & Price */}
                  <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                    {rec.title}
                  </h3>

                  <div className="mb-2">
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                      {rec.price_range}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 mb-2 line-clamp-3">
                    {rec.description}
                  </p>

                  {/* Compact Info */}
                  <div className="space-y-1 mb-3 text-xs text-gray-600">
                    <div className="flex items-start gap-1">
                      <span>📍</span>
                      <span className="line-clamp-1">{rec.where_to_buy}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span>🏷️</span>
                      <span className="line-clamp-1">{rec.category}</span>
                    </div>
                  </div>

                  {/* AI Reasoning - Collapsible */}
                  <details className="mb-3 text-xs">
                    <summary className="cursor-pointer text-purple-600 font-medium hover:text-purple-700">
                      💡 Why this gift?
                    </summary>
                    <p className="mt-2 text-gray-600 italic pl-4">
                      {rec.reasoning}
                    </p>
                  </details>

                  {/* Actions - Push to bottom */}
                  <div className="mt-auto space-y-2">
                    {/* Shopping Links */}
                    {(rec.amazon_link || rec.google_shopping_link) && (
                      <div className="flex gap-1">
                        {rec.amazon_link && (
                          <a
                            href={rec.amazon_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-2 py-1.5 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors text-center font-medium"
                            title="Shop on Amazon"
                          >
                            🛒 Amazon
                          </a>
                        )}
                        {rec.google_shopping_link && (
                          <a
                            href={rec.google_shopping_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-2 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors text-center font-medium"
                            title="Google Shopping"
                          >
                            🔍 Google
                          </a>
                        )}
                      </div>
                    )}

                    {/* Primary Action */}
                    <button
                      onClick={() => handleFeedback(rec, 'added')}
                      disabled={processingFeedback === rec.title}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      {processingFeedback === rec.title ? (
                        <>
                          <span className="inline-block animate-spin">⏳</span>
                          Adding...
                        </>
                      ) : (
                        <>➕ Add to List</>
                      )}
                    </button>

                    {/* Secondary Action */}
                    <button
                      onClick={() => handleFeedback(rec, 'rejected')}
                      disabled={processingFeedback === rec.title}
                      className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                    >
                      ✕ Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Personality Survey Modal */}
      {recipient && (
        <PersonalitySurveyModal
          isOpen={showSurveyModal}
          onClose={() => setShowSurveyModal(false)}
          recipientId={recipient.id}
          recipientName={recipient.name}
          onComplete={handleSurveyComplete}
        />
      )}

      {/* Profile Suggestions Modal */}
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

      {/* Chat Dialog */}
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
    </>
  );
}