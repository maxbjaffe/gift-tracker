// Avatar Utilities for Gift Tracker

export type AvatarType = 'preset' | 'emoji' | 'ai' | 'photo' | 'initials' | null;

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
  url: string; // Local path to avatar image
}

// Custom 3D avatars - diverse, high-quality illustrations (45 avatars)
export const AVATAR_PRESETS: PresetAvatar[] = [
  // PEOPLE - Custom 3D-style avatars

  // Toddlers (ages 1-4) - 1 avatar
  { id: 'toddler-boy-1', name: 'Curly Toddler', category: 'people', url: '/avatars/toddler-boy-1-256.png' },

  // Boys (ages 5-12) - 3 avatars
  { id: 'boy-1', name: 'Boy 1', category: 'people', url: '/avatars/boy-1-256.png' },
  { id: 'boy-2', name: 'Skater Boy', category: 'people', url: '/avatars/boy-2-256.png' },
  { id: 'boy-3', name: 'Superhero Boy', category: 'people', url: '/avatars/boy-3-256.png' },

  // Girls (ages 5-12) - 1 avatar
  { id: 'girl-1', name: 'Poofy Ponytails', category: 'people', url: '/avatars/girl-1-256.png' },

  // Teen Boys (ages 13-17) - 2 avatars
  { id: 'teen-boy-1', name: 'Teen Boy 1', category: 'people', url: '/avatars/teen-boy-1-256.png' },
  { id: 'teen-boy-2', name: 'Teen Boy 2', category: 'people', url: '/avatars/teen-boy-2-256.png' },

  // Teen Girls (ages 13-17) - 2 avatars
  { id: 'teen-girl-1', name: 'Teen Girl 1', category: 'people', url: '/avatars/teen-girl-1-256.png' },
  { id: 'teen-girl-2', name: 'Braces Girl', category: 'people', url: '/avatars/teen-girl-2-256.png' },

  // Men (adults) - 14 avatars
  { id: 'man-1', name: 'Man 1', category: 'people', url: '/avatars/man-1-256.png' },
  { id: 'man-2', name: 'Man 2', category: 'people', url: '/avatars/man-2-256.png' },
  { id: 'man-3', name: 'Man 3', category: 'people', url: '/avatars/man-3-256.png' },
  { id: 'man-4', name: 'Man 4', category: 'people', url: '/avatars/man-4-256.png' },
  { id: 'man-5', name: 'Man 5', category: 'people', url: '/avatars/man-5-256.png' },
  { id: 'man-6', name: 'Man 6', category: 'people', url: '/avatars/man-6-256.png' },
  { id: 'man-7', name: 'Man 7', category: 'people', url: '/avatars/man-7-256.png' },
  { id: 'man-8', name: 'Man 8', category: 'people', url: '/avatars/man-8-256.png' },
  { id: 'man-9', name: 'Man 9', category: 'people', url: '/avatars/man-9-256.png' },
  { id: 'man-10', name: 'Man 10', category: 'people', url: '/avatars/man-10-256.png' },
  { id: 'man-11', name: 'Tattoo Dad', category: 'people', url: '/avatars/man-11-256.png' },
  { id: 'man-12', name: 'Hipster Guy', category: 'people', url: '/avatars/man-12-256.png' },
  { id: 'man-13', name: 'Tired Dad', category: 'people', url: '/avatars/man-13-256.png' },
  { id: 'man-14', name: 'Tech Bro', category: 'people', url: '/avatars/man-14-256.png' },

  // Women (adults) - 18 avatars
  { id: 'woman-1', name: 'Woman 1', category: 'people', url: '/avatars/woman-1-256.png' },
  { id: 'woman-2', name: 'Woman 2', category: 'people', url: '/avatars/woman-2-256.png' },
  { id: 'woman-3', name: 'Woman 3', category: 'people', url: '/avatars/woman-3-256.png' },
  { id: 'woman-4', name: 'Woman 4', category: 'people', url: '/avatars/woman-4-256.png' },
  { id: 'woman-5', name: 'Woman 5', category: 'people', url: '/avatars/woman-5-256.png' },
  { id: 'woman-6', name: 'Woman 6', category: 'people', url: '/avatars/woman-6-256.png' },
  { id: 'woman-7', name: 'Woman 7', category: 'people', url: '/avatars/woman-7-256.png' },
  { id: 'woman-8', name: 'Woman 8', category: 'people', url: '/avatars/woman-8-256.png' },
  { id: 'woman-9', name: 'Woman 9', category: 'people', url: '/avatars/woman-9-256.png' },
  { id: 'woman-10', name: 'Woman 10', category: 'people', url: '/avatars/woman-10-256.png' },
  { id: 'woman-11', name: 'Woman 11', category: 'people', url: '/avatars/woman-11-256.png' },
  { id: 'woman-12', name: 'Box Braids', category: 'people', url: '/avatars/woman-12-256.png' },
  { id: 'woman-13', name: 'Professional Locs', category: 'people', url: '/avatars/woman-13-256.png' },
  { id: 'woman-14', name: 'Bold Auntie', category: 'people', url: '/avatars/woman-14-256.png' },
  { id: 'woman-15', name: 'Fitness Mom', category: 'people', url: '/avatars/woman-15-256.png' },
  { id: 'woman-16', name: 'Coffee Mom', category: 'people', url: '/avatars/woman-16-256.png' },
  { id: 'woman-17', name: 'Sophisticated', category: 'people', url: '/avatars/woman-17-256.png' },
  { id: 'woman-18', name: 'Artistic', category: 'people', url: '/avatars/woman-18-256.png' },

  // Elderly - 4 avatars
  { id: 'elder-woman-1', name: 'Grandmother 1', category: 'people', url: '/avatars/elder-woman-1-256.png' },
  { id: 'elder-woman-2', name: 'Grandmother 2', category: 'people', url: '/avatars/elder-woman-2-256.png' },
  { id: 'elder-man-1', name: 'Grandfather 1', category: 'people', url: '/avatars/elder-man-1-256.png' },
  { id: 'elder-man-2', name: 'Flannel Grandpa', category: 'people', url: '/avatars/elder-man-2-256.png' },
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
    // Default: first preset avatar (consistent, not random)
    return AVATAR_PRESETS[0].url;
  }

  if (avatarData.type === 'preset') {
    const preset = getPresetById(avatarData.data);
    return preset?.url || AVATAR_PRESETS[0].url; // Use first preset as fallback, not random
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
