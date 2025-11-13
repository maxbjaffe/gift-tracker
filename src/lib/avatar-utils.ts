// Avatar Utilities for Gift Tracker

export type AvatarType = 'preset' | 'emoji' | null;

export interface AvatarData {
  type: AvatarType;
  data: string; // For preset: preset ID, for emoji: emoji character
  background?: string; // For emoji: gradient ID
}

export type AvatarCategory = 'animals' | 'fantasy' | 'robots' | 'fun' | 'abstract';

export interface PresetAvatar {
  id: string;
  name: string;
  category: AvatarCategory;
  style: string; // DiceBear style
  seed: string; // DiceBear seed
  url: string; // Pre-generated URL for instant display
}

// Curated fun avatar presets (30-40 avatars organized by personality)
export const AVATAR_PRESETS: PresetAvatar[] = [
  // ANIMALS (cute and friendly) - 12 avatars
  { id: 'cat-whiskers', name: 'Whiskers the Cat', category: 'animals', style: 'bottts', seed: 'cat-001', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=cat-001' },
  { id: 'dog-buddy', name: 'Buddy the Dog', category: 'animals', style: 'bottts', seed: 'dog-001', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=dog-001' },
  { id: 'fox-sly', name: 'Sly Fox', category: 'animals', style: 'lorelei', seed: 'fox-001', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=fox-001' },
  { id: 'bear-grizzly', name: 'Grizzly Bear', category: 'animals', style: 'lorelei', seed: 'bear-001', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=bear-001' },
  { id: 'owl-wise', name: 'Wise Owl', category: 'animals', style: 'avataaars', seed: 'owl-001', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=owl-001' },
  { id: 'panda-bamboo', name: 'Bamboo Panda', category: 'animals', style: 'fun-emoji', seed: 'panda-001', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=panda-001' },
  { id: 'bunny-hop', name: 'Hoppy Bunny', category: 'animals', style: 'lorelei', seed: 'bunny-001', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=bunny-001' },
  { id: 'penguin-waddle', name: 'Waddles Penguin', category: 'animals', style: 'bottts', seed: 'penguin-001', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=penguin-001' },
  { id: 'koala-eucalyptus', name: 'Eucalyptus Koala', category: 'animals', style: 'fun-emoji', seed: 'koala-001', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=koala-001' },
  { id: 'lion-roar', name: 'Roaring Lion', category: 'animals', style: 'avataaars', seed: 'lion-001', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lion-001' },
  { id: 'elephant-jumbo', name: 'Jumbo Elephant', category: 'animals', style: 'lorelei', seed: 'elephant-001', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=elephant-001' },
  { id: 'turtle-shell', name: 'Shelly Turtle', category: 'animals', style: 'bottts', seed: 'turtle-001', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=turtle-001' },

  // FANTASY (magical and whimsical) - 8 avatars
  { id: 'unicorn-magic', name: 'Magic Unicorn', category: 'fantasy', style: 'lorelei', seed: 'unicorn-001', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=unicorn-001' },
  { id: 'dragon-fire', name: 'Fire Dragon', category: 'fantasy', style: 'bottts', seed: 'dragon-001', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=dragon-001' },
  { id: 'wizard-merlin', name: 'Wizard Merlin', category: 'fantasy', style: 'avataaars', seed: 'wizard-001', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wizard-001' },
  { id: 'fairy-sparkle', name: 'Sparkle Fairy', category: 'fantasy', style: 'lorelei', seed: 'fairy-001', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=fairy-001' },
  { id: 'alien-space', name: 'Space Alien', category: 'fantasy', style: 'bottts', seed: 'alien-001', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=alien-001' },
  { id: 'mermaid-ocean', name: 'Ocean Mermaid', category: 'fantasy', style: 'lorelei', seed: 'mermaid-001', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=mermaid-001' },
  { id: 'phoenix-rise', name: 'Rising Phoenix', category: 'fantasy', style: 'fun-emoji', seed: 'phoenix-001', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=phoenix-001' },
  { id: 'ghost-boo', name: 'Friendly Ghost', category: 'fantasy', style: 'bottts', seed: 'ghost-001', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ghost-001' },

  // ROBOTS (tech and modern) - 8 avatars
  { id: 'robot-beep', name: 'Beep Bot', category: 'robots', style: 'bottts', seed: 'robot-001', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot-001' },
  { id: 'robot-boop', name: 'Boop Bot', category: 'robots', style: 'bottts', seed: 'robot-002', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot-002' },
  { id: 'robot-spark', name: 'Sparky Bot', category: 'robots', style: 'bottts', seed: 'robot-003', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot-003' },
  { id: 'robot-pixel', name: 'Pixel Bot', category: 'robots', style: 'bottts', seed: 'robot-004', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot-004' },
  { id: 'robot-chrome', name: 'Chrome Bot', category: 'robots', style: 'bottts', seed: 'robot-005', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot-005' },
  { id: 'robot-nova', name: 'Nova Bot', category: 'robots', style: 'bottts', seed: 'robot-006', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot-006' },
  { id: 'robot-binary', name: 'Binary Bot', category: 'robots', style: 'bottts', seed: 'robot-007', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot-007' },
  { id: 'robot-circuit', name: 'Circuit Bot', category: 'robots', style: 'bottts', seed: 'robot-008', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot-008' },

  // FUN (playful and quirky) - 6 avatars
  { id: 'fun-happy', name: 'Happy Face', category: 'fun', style: 'fun-emoji', seed: 'happy-001', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=happy-001' },
  { id: 'fun-cool', name: 'Cool Dude', category: 'fun', style: 'avataaars', seed: 'cool-001', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cool-001' },
  { id: 'fun-nerd', name: 'Nerdy', category: 'fun', style: 'avataaars', seed: 'nerd-001', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nerd-001' },
  { id: 'fun-artist', name: 'Artist', category: 'fun', style: 'lorelei', seed: 'artist-001', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=artist-001' },
  { id: 'fun-music', name: 'Music Lover', category: 'fun', style: 'avataaars', seed: 'music-001', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=music-001' },
  { id: 'fun-gamer', name: 'Gamer', category: 'fun', style: 'fun-emoji', seed: 'gamer-001', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=gamer-001' },

  // ABSTRACT (geometric and artistic) - 6 avatars
  { id: 'abstract-geo1', name: 'Geometric 1', category: 'abstract', style: 'personas', seed: 'geo-001', url: 'https://api.dicebear.com/7.x/personas/svg?seed=geo-001' },
  { id: 'abstract-geo2', name: 'Geometric 2', category: 'abstract', style: 'personas', seed: 'geo-002', url: 'https://api.dicebear.com/7.x/personas/svg?seed=geo-002' },
  { id: 'abstract-geo3', name: 'Geometric 3', category: 'abstract', style: 'personas', seed: 'geo-003', url: 'https://api.dicebear.com/7.x/personas/svg?seed=geo-003' },
  { id: 'abstract-color1', name: 'Colorful 1', category: 'abstract', style: 'personas', seed: 'color-001', url: 'https://api.dicebear.com/7.x/personas/svg?seed=color-001' },
  { id: 'abstract-color2', name: 'Colorful 2', category: 'abstract', style: 'personas', seed: 'color-002', url: 'https://api.dicebear.com/7.x/personas/svg?seed=color-002' },
  { id: 'abstract-pattern', name: 'Pattern', category: 'abstract', style: 'personas', seed: 'pattern-001', url: 'https://api.dicebear.com/7.x/personas/svg?seed=pattern-001' },
];

// Gradient backgrounds for emojis
export const AVATAR_GRADIENTS = [
  { id: 'purple', name: 'Purple Dream', class: 'bg-gradient-to-br from-purple-400 to-purple-600', colors: ['#C084FC', '#9333EA'] },
  { id: 'blue', name: 'Ocean Blue', class: 'bg-gradient-to-br from-blue-400 to-blue-600', colors: ['#60A5FA', '#2563EB'] },
  { id: 'green', name: 'Forest Green', class: 'bg-gradient-to-br from-green-400 to-green-600', colors: ['#4ADE80', '#16A34A'] },
  { id: 'pink', name: 'Pink Blush', class: 'bg-gradient-to-br from-pink-400 to-pink-600', colors: ['#F472B6', '#DB2777'] },
  { id: 'orange', name: 'Sunset Orange', class: 'bg-gradient-to-br from-orange-400 to-orange-600', colors: ['#FB923C', '#EA580C'] },
  { id: 'teal', name: 'Teal Wave', class: 'bg-gradient-to-br from-teal-400 to-teal-600', colors: ['#2DD4BF', '#0D9488'] },
  { id: 'indigo', name: 'Indigo Night', class: 'bg-gradient-to-br from-indigo-400 to-indigo-600', colors: ['#818CF8', '#4F46E5'] },
  { id: 'rose', name: 'Rose Garden', class: 'bg-gradient-to-br from-rose-400 to-rose-600', colors: ['#FB7185', '#E11D48'] },
  { id: 'amber', name: 'Golden Amber', class: 'bg-gradient-to-br from-amber-400 to-amber-600', colors: ['#FBBF24', '#D97706'] },
  { id: 'cyan', name: 'Cyan Sky', class: 'bg-gradient-to-br from-cyan-400 to-cyan-600', colors: ['#22D3EE', '#0891B2'] },
];

// Popular emojis for quick avatar creation
export const AVATAR_EMOJIS = [
  // People & Expressions
  '😀', '😃', '😄', '😁', '😊', '😇', '🙂', '😉', '😌', '😍',
  '🥰', '😎', '🥳', '🤩', '🤗', '🤓', '🧐',
  // Animals
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦉',
  '🦇', '🦄', '🐝', '🦋',
  // Objects & Symbols
  '⭐', '🌟', '✨', '🔥', '💖', '💕', '🎨', '🎭', '🎮', '🎯',
  '🎲', '🎵', '🎸', '📚', '✏️', '🎁', '🎈', '🎂', '🍕', '🍔',
  '🍿', '🧁', '🍩', '🍪',
  // Nature
  '🌸', '🌺', '🌻', '🌼', '🌷', '🌹', '🌴', '🌵', '🍀', '🌿',
  '🔮', '🎃', '🚀', '💎', '🌈', '☀️', '🌙',
];

// Helper Functions

// Get random element from array
export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Get random preset avatar
export function getRandomPreset(): PresetAvatar {
  return getRandomElement(AVATAR_PRESETS);
}

// Get random gradient
export function getRandomGradient(): string {
  return getRandomElement(AVATAR_GRADIENTS).id;
}

// Get random emoji
export function getRandomEmoji(): string {
  return getRandomElement(AVATAR_EMOJIS);
}

// Get gradient class by ID
export function getGradientClass(gradientId: string): string {
  const gradient = AVATAR_GRADIENTS.find(g => g.id === gradientId);
  return gradient?.class || AVATAR_GRADIENTS[0].class;
}

// Get preset avatar by ID
export function getPresetById(id: string): PresetAvatar | undefined {
  return AVATAR_PRESETS.find(p => p.id === id);
}

// Get presets by category
export function getPresetsByCategory(category: AvatarCategory): PresetAvatar[] {
  return AVATAR_PRESETS.filter(p => p.category === category);
}

// Generate default avatar for a new recipient
export function generateDefaultAvatar(): AvatarData {
  const randomPreset = getRandomPreset();
  return {
    type: 'preset',
    data: randomPreset.id,
  };
}

// Create avatar URL based on type and data
export function getAvatarUrl(avatarData: AvatarData | null): string {
  if (!avatarData || !avatarData.type) {
    // Default: random preset avatar
    return getRandomPreset().url;
  }

  if (avatarData.type === 'preset') {
    const preset = getPresetById(avatarData.data);
    return preset?.url || getRandomPreset().url;
  }

  // Emoji avatars don't have URLs, they're rendered as components
  return '';
}

// Avatar size classes
export function getAvatarSizeClasses(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md'): string {
  const sizes = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-xl',
    lg: 'w-24 h-24 text-3xl',
    xl: 'w-32 h-32 text-4xl',
  };
  return sizes[size];
}

// Get avatar display name
export function getAvatarDisplayName(avatarData: AvatarData | null): string {
  if (!avatarData || !avatarData.type) {
    return 'Random Avatar';
  }

  if (avatarData.type === 'preset') {
    const preset = getPresetById(avatarData.data);
    return preset?.name || 'Avatar';
  }

  if (avatarData.type === 'emoji') {
    return `${avatarData.data} Emoji`;
  }

  return 'Avatar';
}
