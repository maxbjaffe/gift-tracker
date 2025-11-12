// Avatar Selector Component - Interactive avatar creation/selection

'use client';

import { useState, useEffect } from 'react';
import Avatar from './Avatar';
import {
  type AvatarType,
  DICEBEAR_STYLES,
  AVATAR_GRADIENTS,
  AVATAR_EMOJIS,
  generateInitials,
  getRandomDiceBearStyle,
  getRandomGradient,
  getRandomEmoji
} from '@/lib/avatar-utils';

export interface AvatarData {
  type: AvatarType;
  data: string;
  background: string;
}

export interface AvatarSelectorProps {
  name: string;
  currentAvatar?: AvatarData | null;
  onChange: (avatar: AvatarData) => void;
}

export default function AvatarSelector({ name, currentAvatar, onChange }: AvatarSelectorProps) {
  const [activeTab, setActiveTab] = useState<AvatarType>('ai');
  const [previewAvatar, setPreviewAvatar] = useState<AvatarData>({
    type: 'ai',
    data: name || 'default',
    background: 'adventurer'
  });

  // Initialize from current avatar
  useEffect(() => {
    if (currentAvatar) {
      setActiveTab(currentAvatar.type || 'ai');
      setPreviewAvatar(currentAvatar as AvatarData);
    } else {
      // Generate default AI avatar
      const defaultAvatar: AvatarData = {
        type: 'ai',
        data: name || Math.random().toString(),
        background: getRandomDiceBearStyle()
      };
      setPreviewAvatar(defaultAvatar);
      onChange(defaultAvatar);
    }
  }, [currentAvatar, name]);

  const handleAvatarChange = (newAvatar: AvatarData) => {
    setPreviewAvatar(newAvatar);
    onChange(newAvatar);
  };

  const handleRegenerateAI = () => {
    const newStyle = DICEBEAR_STYLES[Math.floor(Math.random() * DICEBEAR_STYLES.length)].id;
    const newSeed = Math.random().toString();
    handleAvatarChange({
      type: 'ai',
      data: newSeed,
      background: newStyle
    });
  };

  const tabs = [
    { id: 'ai' as AvatarType, name: 'AI Generated', icon: '🤖' },
    { id: 'emoji' as AvatarType, name: 'Emoji', icon: '😊' },
    { id: 'initials' as AvatarType, name: 'Initials', icon: 'AB' },
    { id: 'photo' as AvatarType, name: 'Photo', icon: '📷' }
  ];

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex flex-col items-center space-y-3 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
        <div className="relative">
          <Avatar
            {...previewAvatar}
            name={name}
            size="xl"
            showBorder
            className="shadow-lg"
          />
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
            <span className="text-2xl">{tabs.find(t => t.id === activeTab)?.icon}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 font-medium">{name || 'Preview'}</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-purple-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'ai' && (
          <AIAvatarTab
            currentSeed={previewAvatar.data}
            currentStyle={previewAvatar.background}
            onChange={(data, background) =>
              handleAvatarChange({ type: 'ai', data, background })
            }
            onRegenerate={handleRegenerateAI}
          />
        )}

        {activeTab === 'emoji' && (
          <EmojiAvatarTab
            currentEmoji={previewAvatar.data}
            currentBackground={previewAvatar.background}
            onChange={(data, background) =>
              handleAvatarChange({ type: 'emoji', data, background })
            }
          />
        )}

        {activeTab === 'initials' && (
          <InitialsAvatarTab
            name={name}
            currentInitials={previewAvatar.data}
            currentBackground={previewAvatar.background}
            onChange={(data, background) =>
              handleAvatarChange({ type: 'initials', data, background })
            }
          />
        )}

        {activeTab === 'photo' && (
          <PhotoAvatarTab
            currentPhoto={previewAvatar.data}
            onChange={(data) =>
              handleAvatarChange({ type: 'photo', data, background: '' })
            }
          />
        )}
      </div>
    </div>
  );
}

// AI Avatar Tab
function AIAvatarTab({
  currentSeed,
  currentStyle,
  onChange,
  onRegenerate
}: {
  currentSeed: string;
  currentStyle: string;
  onChange: (seed: string, style: string) => void;
  onRegenerate: () => void;
}) {
  const [selectedStyle, setSelectedStyle] = useState(currentStyle);

  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
    onChange(currentSeed, style);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Choose Style</h3>
        <button
          onClick={onRegenerate}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          🎲 Regenerate
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {DICEBEAR_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => handleStyleChange(style.id)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedStyle === style.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=${currentSeed}`}
                  alt={style.name}
                  className="w-full h-full"
                />
              </div>
              <span className="text-xs font-medium text-gray-700">{style.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Emoji Avatar Tab
function EmojiAvatarTab({
  currentEmoji,
  currentBackground,
  onChange
}: {
  currentEmoji: string;
  currentBackground: string;
  onChange: (emoji: string, background: string) => void;
}) {
  const [selectedEmoji, setSelectedEmoji] = useState(currentEmoji || '🎁');
  const [selectedBackground, setSelectedBackground] = useState(currentBackground || 'purple');

  const handleEmojiChange = (emoji: string) => {
    setSelectedEmoji(emoji);
    onChange(emoji, selectedBackground);
  };

  const handleBackgroundChange = (background: string) => {
    setSelectedBackground(background);
    onChange(selectedEmoji, background);
  };

  const handleRandom = () => {
    const randomEmoji = getRandomEmoji();
    const randomBg = getRandomGradient();
    setSelectedEmoji(randomEmoji);
    setSelectedBackground(randomBg);
    onChange(randomEmoji, randomBg);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Choose Emoji</h3>
        <button
          onClick={handleRandom}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          🎲 Random
        </button>
      </div>

      <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 max-h-[200px] overflow-y-auto p-2 bg-gray-50 rounded-lg">
        {AVATAR_EMOJIS.map((emoji, index) => (
          <button
            key={index}
            onClick={() => handleEmojiChange(emoji)}
            className={`text-2xl p-2 rounded-lg transition-all hover:scale-110 ${
              selectedEmoji === emoji ? 'bg-purple-100 scale-110' : 'hover:bg-white'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Background Color</h3>
        <div className="grid grid-cols-5 gap-2">
          {AVATAR_GRADIENTS.map((gradient) => (
            <button
              key={gradient.id}
              onClick={() => handleBackgroundChange(gradient.id)}
              className={`h-12 rounded-lg ${gradient.class} transition-all ${
                selectedBackground === gradient.id
                  ? 'ring-2 ring-purple-500 ring-offset-2 scale-105'
                  : 'hover:scale-105'
              }`}
              title={gradient.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Initials Avatar Tab
function InitialsAvatarTab({
  name,
  currentInitials,
  currentBackground,
  onChange
}: {
  name: string;
  currentInitials: string;
  currentBackground: string;
  onChange: (initials: string, background: string) => void;
}) {
  const defaultInitials = generateInitials(name);
  const [initials, setInitials] = useState(currentInitials || defaultInitials);
  const [selectedBackground, setSelectedBackground] = useState(currentBackground || 'purple');

  useEffect(() => {
    if (!currentInitials && name) {
      const newInitials = generateInitials(name);
      setInitials(newInitials);
      onChange(newInitials, selectedBackground);
    }
  }, [name]);

  const handleInitialsChange = (value: string) => {
    const upper = value.toUpperCase().slice(0, 2);
    setInitials(upper);
    onChange(upper, selectedBackground);
  };

  const handleBackgroundChange = (background: string) => {
    setSelectedBackground(background);
    onChange(initials, background);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Initials (1-2 characters)
        </label>
        <input
          type="text"
          value={initials}
          onChange={(e) => handleInitialsChange(e.target.value)}
          maxLength={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-bold uppercase"
          placeholder="AB"
        />
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Background Color</h3>
        <div className="grid grid-cols-5 gap-2">
          {AVATAR_GRADIENTS.map((gradient) => (
            <button
              key={gradient.id}
              onClick={() => handleBackgroundChange(gradient.id)}
              className={`h-12 rounded-lg ${gradient.class} transition-all ${
                selectedBackground === gradient.id
                  ? 'ring-2 ring-purple-500 ring-offset-2 scale-105'
                  : 'hover:scale-105'
              }`}
              title={gradient.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Photo Avatar Tab
function PhotoAvatarTab({
  currentPhoto,
  onChange
}: {
  currentPhoto: string;
  onChange: (photoUrl: string) => void;
}) {
  const [photoUrl, setPhotoUrl] = useState(currentPhoto || '');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');

  const handleUrlChange = (url: string) => {
    setPhotoUrl(url);
    if (url) onChange(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoUrl(base64);
        onChange(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setUploadMethod('url')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            uploadMethod === 'url'
              ? 'bg-white text-purple-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🔗 Image URL
        </button>
        <button
          onClick={() => setUploadMethod('file')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            uploadMethod === 'file'
              ? 'bg-white text-purple-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📁 Upload File
        </button>
      </div>

      {uploadMethod === 'url' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="https://example.com/photo.jpg"
          />
          <p className="mt-2 text-xs text-gray-500">
            Paste a direct link to an image (jpg, png, gif)
          </p>
        </div>
      )}

      {uploadMethod === 'file' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Photo
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-10 h-10 mb-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 2MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      )}

      {photoUrl && (
        <div className="mt-4">
          <p className="text-sm text-green-600 font-medium mb-2">✓ Photo loaded successfully!</p>
        </div>
      )}
    </div>
  );
}
