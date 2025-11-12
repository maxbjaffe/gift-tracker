// src/app/recipients/[id]/page.tsx - UPDATED to pass price_range and where_to_buy

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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

  const generateRecommendations = async () => {
    if (!recipient) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: recipient.id })
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
          price_range: recommendation.price_range,      // PASS THIS
          where_to_buy: recommendation.where_to_buy,    // PASS THIS
          feedback_type: feedbackType,
        })
      });

      if (!response.ok) throw new Error('Failed to record feedback');

      const result = await response.json();

      // Show appropriate message based on feedback type
      const messages = {
        added: '👍 Gift added! Refreshing gifts...',
        liked: '❤️ Marked as loved!',
        rejected: '😐 Marked as not interested',
        already_have: '✅ Marked as already owned'
      };

      alert(messages[feedbackType]);

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipient...</p>
        </div>
      </div>
    );
  }

  if (!recipient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Recipient not found</p>
          <Link 
            href="/recipients"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Recipients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/recipients"
            className="text-purple-600 hover:text-purple-700 font-medium mb-4 inline-block"
          >
            ← Back to Recipients
          </Link>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  🎁 {recipient.name}
                </h1>
                <p className="text-gray-600 text-lg">
                  {recipient.relationship} • Age: {recipient.age_range}
                </p>
                {recipient.birthday && (
                  <p className="text-gray-500 mt-2">
                    🎂 Birthday: {new Date(recipient.birthday).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Link
                  href={`/recipients/${recipient.id}/edit`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ✏️ Edit
                </Link>
              </div>
            </div>

            {/* Quick Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipient.interests && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Interests</h3>
                  <p className="text-gray-600">{recipient.interests}</p>
                </div>
              )}
              {recipient.max_budget && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Max Budget</h3>
                  <p className="text-2xl font-bold text-green-600">
                    ${recipient.max_budget.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assigned Gifts Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Assigned Gifts ({assignedGifts.length})
              </h2>
              <Link
                href={`/gifts/new?recipient=${recipient.id}`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                + Add Gift
              </Link>
            </div>

            {assignedGifts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No gifts assigned yet. Add one or generate AI recommendations!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedGifts.map((gift) => (
                  <Link
                    key={gift.id}
                    href={`/gifts/${gift.id}`}
                    className="block p-4 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{gift.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      {gift.price && (
                        <p className="text-lg font-bold text-purple-600">
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
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🤖 AI Gift Recommendations
            </h2>
            <button
              onClick={generateRecommendations}
              disabled={generating}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {generating ? (
                <>
                  <span className="inline-block animate-spin mr-2">⚡</span>
                  Generating...
                </>
              ) : (
                '✨ Generate Ideas'
              )}
            </button>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No recommendations yet</p>
              <p className="text-sm">Click "Generate Ideas" to get AI-powered gift suggestions!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {rec.title}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-700 mb-3">{rec.description}</p>
                      <p className="text-sm text-gray-600 italic">
                        💡 {rec.reasoning}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Price Range</p>
                        <p className="text-2xl font-bold text-green-600">
                          {rec.price_range}
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Where to Buy</p>
                        <p className="text-sm font-medium text-blue-700">
                          {rec.where_to_buy}
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Category</p>
                        <p className="text-sm font-medium text-purple-700">
                          {rec.category}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleFeedback(rec, 'added')}
                      disabled={processingFeedback === rec.title}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                      className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ❤️ Love It
                    </button>
                    
                    <button
                      onClick={() => handleFeedback(rec, 'rejected')}
                      disabled={processingFeedback === rec.title}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      😐 Not Interested
                    </button>
                    
                    <button
                      onClick={() => handleFeedback(rec, 'already_have')}
                      disabled={processingFeedback === rec.title}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}