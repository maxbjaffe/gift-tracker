// Avatar Utilities for Gift Tracker

export type AvatarType = 'ai' | 'emoji' | 'initials' | 'photo' | null;

export interface AvatarData {
  type: AvatarType;
  data: string;
  background?: string;
}

// DiceBear avatar styles (free, no auth needed)
export const DICEBEAR_STYLES = [
  { id: 'adventurer', name: 'Adventurer', description: 'Cute cartoon faces' },
  { id: 'avataaars', name: 'Avataaars', description: 'Sketch-style avatars' },
  { id: 'bottts', name: 'Bottts', description: 'Robot avatars' },
  { id: 'fun-emoji', name: 'Fun Emoji', description: 'Playful emoji faces' },
  { id: 'lorelei', name: 'Lorelei', description: 'Modern illustrated faces' },
  { id: 'micah', name: 'Micah', description: 'Geometric faces' },
  { id: 'personas', name: 'Personas', description: 'Abstract faces' },
  { id: 'pixel-art', name: 'Pixel Art', description: 'Retro pixel avatars' },
];

// Gradient backgrounds for initials and emoj is
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

// Popular emojis for avatars
export const AVATAR_EMOJIS = [
  // People
  '😀', '😃', '😄', '😁', '😊', '😇', '🙂', '🙃', '😉', '😌',
  '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
  '🤓', '😎', '🥳', '🤩', '🤗', '🤔', '🧐', '🤨', '😐', '😑',
  // Animals
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
  '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌',
  // Objects & Symbols
  '⭐', '🌟', '✨', '🔥', '💖', '💕', '💝', '💗', '💓', '💞',
  '🎨', '🎭', '🎪', '🎬', '🎮', '🎯', '🎲', '🎵', '🎶', '🎸',
  '🎹', '🎺', '🎻', '🥁', '📚', '📖', '✏️', '🖊️', '🖍️', '🎁',
  '🎈', '🎀', '🎂', '🍕', '🍔', '🍟', '🍿', '🧁', '🍩', '🍪',
  // Nature
  '🌸', '🌺', '🌻', '🌼', '🌷', '🌹', '🥀', '🌴', '🌵', '🌲',
  '🌳', '🍀', '🍁', '🍂', '🍃', '🌿', '☘️', '🌾', '🌱', '🌊',
  '🔮', '🎃', '🎄', '🎋', '🎍', '🎑', '🎏', '🎐', '🧧', '🎎'
];

// Generate DiceBear avatar URL
export function generateDiceBearAvatar(seed: string, style: string = 'adventurer'): string {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

// Generate initials from name
export function generateInitials(name: string): string {
  if (!name) return '?';

  const parts = name.trim().split(' ').filter(p => p.length > 0);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Get random element from array
export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Get random DiceBear style
export function getRandomDiceBearStyle(): string {
  return getRandomElement(DICEBEAR_STYLES).id;
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

// Generate avatar data for a new recipient
export function generateDefaultAvatar(name: string): AvatarData {
  const style = getRandomDiceBearStyle();
  const seed = name || Math.random().toString();

  return {
    type: 'ai',
    data: seed,
    background: style,
  };
}

// Create avatar URL based on type and data
export function getAvatarUrl(avatarData: AvatarData | null, name: string = ''): string {
  if (!avatarData || !avatarData.type) {
    // Default: generate AI avatar
    const seed = name || 'default';
    return generateDiceBearAvatar(seed, 'adventurer');
  }

  switch (avatarData.type) {
    case 'ai':
      return generateDiceBearAvatar(avatarData.data, avatarData.background || 'adventurer');

    case 'photo':
      return avatarData.data; // Direct image URL

    case 'emoji':
    case 'initials':
      // These will be rendered as components, not URLs
      return '';

    default:
      return generateDiceBearAvatar(name || 'default', 'adventurer');
  }
}

// Get avatar component props
export interface AvatarProps {
  type: AvatarType;
  data: string;
  background: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

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
