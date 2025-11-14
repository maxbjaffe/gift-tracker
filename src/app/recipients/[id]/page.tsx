// src/app/recipients/[id]/page.tsx - UPDATED to pass price_range and where_to_buy

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import PersonalitySurveyModal from '@/components/PersonalitySurveyModal';
import ProfileSuggestionsModal from '@/components/ProfileSuggestionsModal';
import ChatDialog from '@/components/ChatDialog';
import AssignGiftsDialog from '@/components/AssignGiftsDialog';
import { createClient } from '@/lib/supabase/client';
import { formatAgeDisplay } from '@/lib/utils/age';

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

  useEffect(() => {
    if (params.id) {
      fetchRecipient();
      fetchAssignedGifts();
    }
  }, [params.id]);

  const fetchRecipient = async () => {
    try {
      const response = await fetch(`/api/recipients/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch recipient');
      const data = await response.json();
      setRecipient(data);
    } catch (error) {
      console.error('Error fetching recipient:', error);
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
      console.error('Error fetching assigned gifts:', error);
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
      console.error('Error analyzing survey:', error);
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
      console.error('Error applying suggestions:', error);
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
      console.error('Error generating recommendations:', error);
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
        console.log('Price extraction debug:', result.debug);
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
      console.error('Error recording feedback:', error);
      alert('Failed to record feedback');
    } finally {
      setProcessingFeedback(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-sm md:text-base text-gray-600">Loading recipient...</p>
        </div>
      </div>
    );
  }

  if (!recipient) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 space-y-4 md:space-y-6">
          <Link
            href="/recipients"
            className="text-sm md:text-base text-purple-600 hover:text-purple-700 font-medium inline-block"
          >
            ← Back to Recipients
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 w-full md:w-auto">
                <Avatar
                  type={recipient.avatar_type}
                  data={recipient.avatar_data}
                  background={recipient.avatar_background}
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

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowSurveyModal(true)}
                  className="px-4 h-11 md:h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg flex items-center justify-center gap-2 text-sm md:text-base font-medium"
                >
                  ✨ Take Personality Survey
                </button>
                <ChatDialog recipientId={recipient.id} recipientName={recipient.name} />
                <Link
                  href={`/recipients/${recipient.id}/edit`}
                  className="px-4 h-11 md:h-12 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm md:text-base"
                >
                  ✏️ Edit Profile
                </Link>
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

        {/* Assigned Gifts Section */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                Assigned Gifts ({assignedGifts.length})
              </h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
            </div>

            {assignedGifts.length === 0 ? (
              <p className="text-sm md:text-base text-gray-500 text-center py-6 md:py-8">
                No gifts assigned yet. Add one or generate AI recommendations!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {assignedGifts.map((gift) => (
                  <Link
                    key={gift.id}
                    href={`/gifts/${gift.id}/edit`}
                    className="block p-3 md:p-4 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all"
                  >
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">{gift.name}</h3>
                    <div className="space-y-1 text-xs md:text-sm text-gray-600">
                      {gift.price && (
                        <p className="text-base md:text-lg font-bold text-purple-600">
                          ${gift.price.toFixed(2)}
                        </p>
                      )}
                      {gift.store && <p>🏪 {gift.store}</p>}
                      {gift.brand && <p>⭐ {gift.brand}</p>}
                      <p className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {gift.status}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
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
            <div className="space-y-4 md:space-y-6">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-200 rounded-xl p-4 md:p-5 lg:p-6 hover:border-purple-300 transition-all"
                >
                  <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                    {rec.title}
                  </h3>

                  {rec.image_url && (
                    <div className="mb-3 md:mb-4 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={rec.image_url}
                        alt={rec.title}
                        className="w-full h-48 md:h-64 object-cover"
                      />
                    </div>
                  )}

                  {(rec.amazon_link || rec.google_shopping_link) && (
                    <div className="flex flex-col sm:flex-row gap-2 mb-3 md:mb-4">
                      {rec.amazon_link && (
                        <a
                          href={rec.amazon_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 h-11 md:h-12 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-center font-medium flex items-center justify-center text-sm md:text-base"
                        >
                          🛒 Shop on Amazon
                        </a>
                      )}
                      {rec.google_shopping_link && (
                        <a
                          href={rec.google_shopping_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 h-11 md:h-12 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center font-medium flex items-center justify-center text-sm md:text-base"
                        >
                          🔍 Google Shopping
                        </a>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                    <div>
                      <p className="text-sm md:text-base text-gray-700 mb-3">{rec.description}</p>
                      <p className="text-xs md:text-sm text-gray-600 italic">
                        💡 {rec.reasoning}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs md:text-sm text-gray-600 mb-1">Price Range</p>
                        <p className="text-lg md:text-xl lg:text-2xl font-bold text-green-600">
                          {rec.price_range}
                        </p>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs md:text-sm text-gray-600 mb-1">Where to Buy</p>
                        <p className="text-xs md:text-sm font-medium text-blue-700">
                          {rec.where_to_buy}
                        </p>
                      </div>

                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs md:text-sm text-gray-600 mb-1">Category</p>
                        <p className="text-xs md:text-sm font-medium text-purple-700">
                          {rec.category}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Buttons */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-3 md:pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleFeedback(rec, 'added')}
                      disabled={processingFeedback === rec.title}
                      className="flex-1 sm:flex-none px-3 md:px-4 h-11 md:h-12 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                      {processingFeedback === rec.title ? (
                        <>
                          <span className="inline-block animate-spin">⏳</span>
                          Processing...
                        </>
                      ) : (
                        <>👍 Add to Gifts</>
                      )}
                    </button>

                    <button
                      onClick={() => handleFeedback(rec, 'liked')}
                      disabled={processingFeedback === rec.title}
                      className="flex-1 sm:flex-none px-3 md:px-4 h-11 md:h-12 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                      ❤️ Love It
                    </button>

                    <button
                      onClick={() => handleFeedback(rec, 'rejected')}
                      disabled={processingFeedback === rec.title}
                      className="flex-1 sm:flex-none px-3 md:px-4 h-11 md:h-12 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                      😐 Not Interested
                    </button>

                    <button
                      onClick={() => handleFeedback(rec, 'already_have')}
                      disabled={processingFeedback === rec.title}
                      className="flex-1 sm:flex-none px-3 md:px-4 h-11 md:h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                      ✅ Already Have
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