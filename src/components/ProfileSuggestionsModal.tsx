'use client';

import { useState } from 'react';
import { X, Check, Sparkles, AlertCircle } from 'lucide-react';

interface ProfileSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  suggestions: {
    interests?: string[];
    hobbies?: string[];
    favorite_colors?: string[];
    favorite_brands?: string[];
    favorite_stores?: string[];
    gift_preferences?: string;
    gift_dos?: string[];
    gift_donts?: string[];
    restrictions?: string[];
    items_already_owned?: string[];
    notes?: string;
    profile_summary?: string;
    gift_recommendations?: string[];
  };
  onApply: (suggestions: any) => void;
  isApplying: boolean;
}

export default function ProfileSuggestionsModal({
  isOpen,
  onClose,
  recipientName,
  suggestions,
  onApply,
  isApplying
}: ProfileSuggestionsModalProps) {
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(Object.keys(suggestions))
  );

  if (!isOpen) return null;

  const toggleField = (field: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(field)) {
      newSelected.delete(field);
    } else {
      newSelected.add(field);
    }
    setSelectedFields(newSelected);
  };

  const handleApply = () => {
    const selectedSuggestions: any = {};
    selectedFields.forEach(field => {
      if (field in suggestions) {
        selectedSuggestions[field] = suggestions[field as keyof typeof suggestions];
      }
    });
    onApply(selectedSuggestions);
  };

  const renderFieldPreview = (label: string, field: keyof typeof suggestions, icon: string) => {
    const value = suggestions[field];
    if (!value || (Array.isArray(value) && value.length === 0)) return null;

    const isSelected = selectedFields.has(field);

    return (
      <div
        key={field}
        className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
          isSelected
            ? 'border-purple-600 bg-purple-50'
            : 'border-gray-200 hover:border-purple-300'
        }`}
        onClick={() => toggleField(field)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <h4 className="font-semibold text-gray-900">{label}</h4>
          </div>
          <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-purple-600 border-purple-600'
              : 'border-gray-300'
          }`}>
            {isSelected && <Check className="h-3 w-3 text-white" />}
          </div>
        </div>
        <div className="text-sm text-gray-700">
          {Array.isArray(value) ? (
            <div className="flex flex-wrap gap-1.5">
              {value.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-1 bg-white border border-gray-300 rounded text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{value}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              disabled={isApplying}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">AI Profile Suggestions</h2>
                <p className="text-purple-100 mt-1">
                  Review and apply updates to {recipientName}'s profile
                </p>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">How this works:</p>
                <p>
                  Our AI analyzed the survey responses and existing profile to generate these
                  suggestions. Select which fields you want to update, then click "Apply Selected
                  Updates". Your existing data will be intelligently merged with these new insights.
                </p>
              </div>
            </div>
          </div>

          {/* Profile Summary */}
          {suggestions.profile_summary && (
            <div className="border-b bg-purple-50 p-6">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Profile Summary
              </h3>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                {suggestions.profile_summary}
              </p>
            </div>
          )}

          {/* Suggestions List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {renderFieldPreview('Interests & Hobbies', 'interests', '🎯')}
            {renderFieldPreview('Hobbies & Activities', 'hobbies', '🎨')}
            {renderFieldPreview('Favorite Colors', 'favorite_colors', '🎨')}
            {renderFieldPreview('Favorite Brands', 'favorite_brands', '⭐')}
            {renderFieldPreview('Favorite Stores', 'favorite_stores', '🛍️')}
            {renderFieldPreview('Gift Preferences', 'gift_preferences', '🎁')}
            {renderFieldPreview('Gift Do\'s (They Love)', 'gift_dos', '✅')}
            {renderFieldPreview('Gift Don\'ts (Avoid)', 'gift_donts', '❌')}
            {renderFieldPreview('Restrictions & Allergies', 'restrictions', '⚠️')}
            {renderFieldPreview('Items Already Owned', 'items_already_owned', '📦')}
            {renderFieldPreview('Additional Notes', 'notes', '📝')}

            {/* Gift Recommendations */}
            {suggestions.gift_recommendations && suggestions.gift_recommendations.length > 0 && (
              <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">💡</span>
                  <h4 className="font-semibold text-gray-900">AI Gift Recommendations</h4>
                </div>
                <ul className="space-y-2">
                  {suggestions.gift_recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-600 font-bold mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-6 flex flex-col sm:flex-row justify-between gap-4">
            <div className="text-sm text-gray-600">
              <p className="font-medium">{selectedFields.size} fields selected</p>
              <button
                onClick={() => setSelectedFields(new Set(Object.keys(suggestions)))}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Select all
              </button>
              {' • '}
              <button
                onClick={() => setSelectedFields(new Set())}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Deselect all
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isApplying}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={isApplying || selectedFields.size === 0}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
              >
                {isApplying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Apply Selected Updates
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
