// Avatar Selector - Gallery-Based Approach (Simplified & Fast)

'use client';

import { useState, useMemo } from 'react';
import Avatar from './Avatar';
import {
  type AvatarData,
  type AvatarCategory,
  AVATAR_PRESETS,
  AVATAR_EMOJIS,
  AVATAR_GRADIENTS,
  getPresetsByCategory,
  getRandomPreset,
  getRandomEmoji,
  getRandomGradient,
} from '@/lib/avatar-utils';

export interface AvatarSelectorProps {
  value: AvatarData | null;
  onChange: (avatarData: AvatarData) => void;
  name?: string;
}

export default function AvatarSelector({ value, onChange, name = '' }: AvatarSelectorProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'emoji'>('presets');
  const [selectedCategory, setSelectedCategory] = useState<AvatarCategory | 'all'>('all');
  const [selectedGradient, setSelectedGradient] = useState(value?.background || 'purple');

  // Filter presets by category
  const filteredPresets = useMemo(() => {
    if (selectedCategory === 'all') return AVATAR_PRESETS;
    return getPresetsByCategory(selectedCategory);
  }, [selectedCategory]);

  // Quick actions
  const handleSurpriseMe = () => {
    const randomPreset = getRandomPreset();
    onChange({
      type: 'preset',
      data: randomPreset.id,
    });
  };

  const handleRandomEmoji = () => {
    const randomEmoji = getRandomEmoji();
    const randomGradient = getRandomGradient();
    onChange({
      type: 'emoji',
      data: randomEmoji,
      background: randomGradient,
    });
    setSelectedGradient(randomGradient);
  };

  const categories: Array<{ id: AvatarCategory | 'all'; label: string; emoji: string }> = [
    { id: 'all', label: 'All', emoji: '🎨' },
    { id: 'animals', label: 'Animals', emoji: '🐾' },
    { id: 'fantasy', label: 'Fantasy', emoji: '🦄' },
    { id: 'robots', label: 'Robots', emoji: '🤖' },
    { id: 'fun', label: 'Fun', emoji: '🎉' },
    { id: 'abstract', label: 'Abstract', emoji: '🎭' },
  ];

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Preview Section */}
      <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
        <Avatar
          type={value?.type || 'preset'}
          data={value?.data}
          background={value?.background}
          name={name}
          size="lg"
          showBorder
          className="md:w-24 md:h-24"
        />
        <div className="flex-1 text-center sm:text-left w-full">
          <h3 className="font-semibold text-base md:text-lg">Avatar Preview</h3>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
            {value?.type === 'emoji'
              ? `${value.data} Emoji Avatar`
              : value?.type === 'preset' && value?.data
              ? AVATAR_PRESETS.find(p => p.id === value.data)?.name || 'Avatar'
              : 'No avatar selected'}
          </p>
          <button
            onClick={handleSurpriseMe}
            className="mt-2 w-full sm:w-auto min-h-11 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 active:scale-95"
          >
            ✨ Surprise Me!
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 md:gap-2 border-b border-gray-200 dark:border-gray-700 -mx-1">
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 sm:flex-none px-3 md:px-4 py-2.5 md:py-3 font-medium text-xs sm:text-sm transition-colors touch-manipulation ${
            activeTab === 'presets'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          🎨 Fun Avatars
        </button>
        <button
          onClick={() => setActiveTab('emoji')}
          className={`flex-1 sm:flex-none px-3 md:px-4 py-2.5 md:py-3 font-medium text-xs sm:text-sm transition-colors touch-manipulation ${
            activeTab === 'emoji'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          😊 Emoji Avatars
        </button>
      </div>

      {/* Presets Tab */}
      {activeTab === 'presets' && (
        <div className="space-y-3 md:space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-9 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Avatar Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2 md:gap-3 max-h-80 md:max-h-96 overflow-y-auto p-1 md:p-2 -mx-1">
            {filteredPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onChange({ type: 'preset', data: preset.id })}
                className={`group relative aspect-square rounded-lg md:rounded-xl overflow-hidden transition-all transform active:scale-95 md:hover:scale-110 md:hover:z-10 touch-manipulation ${
                  value?.type === 'preset' && value?.data === preset.id
                    ? 'ring-3 md:ring-4 ring-purple-500 shadow-xl scale-105'
                    : 'ring-2 ring-gray-200 dark:ring-gray-700 md:hover:ring-purple-400'
                }`}
                title={preset.name}
                aria-label={`Select ${preset.name}`}
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Hover/Touch overlay with name */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-end justify-center p-1">
                  <span className="text-white text-[10px] sm:text-xs font-medium text-center leading-tight">
                    {preset.name}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 text-center">
            Showing {filteredPresets.length} avatar{filteredPresets.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Emoji Tab */}
      {activeTab === 'emoji' && (
        <div className="space-y-3 md:space-y-4">
          {/* Gradient Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Background Color</label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {AVATAR_GRADIENTS.map((gradient) => (
                <button
                  key={gradient.id}
                  onClick={() => setSelectedGradient(gradient.id)}
                  className={`aspect-square rounded-md md:rounded-lg transition-all transform active:scale-95 md:hover:scale-110 touch-manipulation ${
                    gradient.class
                  } ${
                    selectedGradient === gradient.id
                      ? 'ring-3 md:ring-4 ring-purple-500 shadow-xl scale-105'
                      : 'ring-2 ring-gray-200 dark:ring-gray-700'
                  }`}
                  title={gradient.name}
                  aria-label={`Select ${gradient.name} background`}
                />
              ))}
            </div>
          </div>

          {/* Emoji Grid */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs sm:text-sm font-medium">Choose an Emoji</label>
              <button
                onClick={handleRandomEmoji}
                className="text-xs px-3 py-1.5 min-h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 active:scale-95 transition-all touch-manipulation"
              >
                🎲 Random
              </button>
            </div>
            <div className="grid grid-cols-6 xs:grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14 gap-1.5 md:gap-2 max-h-56 md:max-h-64 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
              {AVATAR_EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => onChange({ type: 'emoji', data: emoji, background: selectedGradient })}
                  className={`aspect-square rounded-md md:rounded-lg text-xl md:text-2xl flex items-center justify-center transition-all transform active:scale-95 md:hover:scale-125 md:hover:z-10 touch-manipulation ${
                    value?.type === 'emoji' && value?.data === emoji
                      ? 'bg-purple-200 dark:bg-purple-800 shadow-lg scale-110'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                  aria-label={`Select ${emoji} emoji`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
