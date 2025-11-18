// Avatar Utilities for Gift Tracker

export type AvatarType = 'preset' | 'emoji' | null;

export interface AvatarData {
  type: AvatarType;
  data: string; // For preset: preset ID, for emoji: emoji character
  background?: string; // For emoji: gradient ID
}

export type AvatarCategory = 'people' | 'animals' | 'fantasy' | 'robots' | 'fun' | 'abstract';

export interface PresetAvatar {
  id: string;
  name: string;
  category: AvatarCategory;
  style: string; // DiceBear style
  seed: string; // DiceBear seed
  url: string; // Pre-generated URL for instant display
}

// Curated avataaars presets organized by age/gender (36 avatars)
export const AVATAR_PRESETS: PresetAvatar[] = [
  // PEOPLE - All using avataaars style for consistency

  // Boys (ages 5-12) - 6 avatars
  { id: 'boy-1', name: 'Boy 1', category: 'people', style: 'avataaars', seed: 'boy-short-hair', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=boy-short-hair' },
  { id: 'boy-2', name: 'Boy 2', category: 'people', style: 'avataaars', seed: 'boy-spiky-hair', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=boy-spiky-hair' },
  { id: 'boy-3', name: 'Boy 3', category: 'people', style: 'avataaars', seed: 'boy-curly', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=boy-curly' },
  { id: 'boy-4', name: 'Boy 4', category: 'people', style: 'avataaars', seed: 'boy-glasses', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=boy-glasses' },
  { id: 'boy-5', name: 'Boy 5', category: 'people', style: 'avataaars', seed: 'boy-smile', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=boy-smile' },
  { id: 'boy-6', name: 'Boy 6', category: 'people', style: 'avataaars', seed: 'boy-happy', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=boy-happy' },

  // Girls (ages 5-12) - 6 avatars
  { id: 'girl-1', name: 'Girl 1', category: 'people', style: 'avataaars', seed: 'girl-long-hair', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=girl-long-hair' },
  { id: 'girl-2', name: 'Girl 2', category: 'people', style: 'avataaars', seed: 'girl-ponytail', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=girl-ponytail' },
  { id: 'girl-3', name: 'Girl 3', category: 'people', style: 'avataaars', seed: 'girl-curly', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=girl-curly' },
  { id: 'girl-4', name: 'Girl 4', category: 'people', style: 'avataaars', seed: 'girl-short', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=girl-short' },
  { id: 'girl-5', name: 'Girl 5', category: 'people', style: 'avataaars', seed: 'girl-glasses', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=girl-glasses' },
  { id: 'girl-6', name: 'Girl 6', category: 'people', style: 'avataaars', seed: 'girl-smile', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=girl-smile' },

  // Teen Boys (ages 13-17) - 6 avatars
  { id: 'teen-boy-1', name: 'Teen Boy 1', category: 'people', style: 'avataaars', seed: 'teen-boy-cool', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teen-boy-cool' },
  { id: 'teen-boy-2', name: 'Teen Boy 2', category: 'people', style: 'avataaars', seed: 'teen-boy-sporty', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teen-boy-sporty' },
  { id: 'teen-boy-3', name: 'Teen Boy 3', category: 'people', style: 'avataaars', seed: 'teen-boy-casual', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teen-boy-casual' },
  { id: 'teen-boy-4', name: 'Teen Boy 4', category: 'people', style: 'avataaars', seed: 'teen-boy-nerd', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teen-boy-nerd' },
  { id: 'teen-boy-5', name: 'Teen Boy 5', category: 'people', style: 'avataaars', seed: 'teen-boy-stylish', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teen-boy-stylish' },
  { id: 'teen-boy-6', name: 'Teen Boy 6', category: 'people', style: 'avataaars', seed: 'teen-boy-messy', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teen-boy-messy' },

  // Teen Girls (ages 13-17) - 6 avatars
  { id: 'teen-girl-1', name: 'Teen Girl 1', category: 'people', style: 'avataaars', seed: 'teen-girl-long', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teen-girl-long' },
  { id: 'teen-girl-2', name: 'Teen Girl 2', category: 'people', style: 'avataaars', seed: 'teen-girl-wavy', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teen-girl-wavy' },
  { id: 'teen-girl-3', name: 'Teen Girl 3', category: 'people', style: 'avataaars', seed: 'teen-girl-sporty', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teen-girl-sporty' },
  { id: 'teen-girl-4', name: 'Teen Girl 4', category: 'people', style: 'avataaars', seed: 'teen-girl-stylish', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teen-girl-stylish' },
  { id: 'teen-girl-5', name: 'Teen Girl 5', category: 'people', style: 'avataaars', seed: 'teen-girl-cool', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teen-girl-cool' },
  { id: 'teen-girl-6', name: 'Teen Girl 6', category: 'people', style: 'avataaars', seed: 'teen-girl-bun', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teen-girl-bun' },

  // Men (adults) - 6 avatars
  { id: 'man-1', name: 'Man 1', category: 'people', style: 'avataaars', seed: 'man-professional', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=man-professional' },
  { id: 'man-2', name: 'Man 2', category: 'people', style: 'avataaars', seed: 'man-beard', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=man-beard' },
  { id: 'man-3', name: 'Man 3', category: 'people', style: 'avataaars', seed: 'man-glasses', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=man-glasses' },
  { id: 'man-4', name: 'Man 4', category: 'people', style: 'avataaars', seed: 'man-casual', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=man-casual' },
  { id: 'man-5', name: 'Man 5', category: 'people', style: 'avataaars', seed: 'man-mustache', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=man-mustache' },
  { id: 'man-6', name: 'Man 6', category: 'people', style: 'avataaars', seed: 'man-short-hair', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=man-short-hair' },

  // Women (adults) - 6 avatars
  { id: 'woman-1', name: 'Woman 1', category: 'people', style: 'avataaars', seed: 'woman-professional', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=woman-professional' },
  { id: 'woman-2', name: 'Woman 2', category: 'people', style: 'avataaars', seed: 'woman-long-hair', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=woman-long-hair' },
  { id: 'woman-3', name: 'Woman 3', category: 'people', style: 'avataaars', seed: 'woman-curly', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=woman-curly' },
  { id: 'woman-4', name: 'Woman 4', category: 'people', style: 'avataaars', seed: 'woman-glasses', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=woman-glasses' },
  { id: 'woman-5', name: 'Woman 5', category: 'people', style: 'avataaars', seed: 'woman-bob', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=woman-bob' },
  { id: 'woman-6', name: 'Woman 6', category: 'people', style: 'avataaars', seed: 'woman-ponytail', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=woman-ponytail' },
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
