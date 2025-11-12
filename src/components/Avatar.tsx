// Avatar Display Component

'use client';

import { useMemo } from 'react';
import {
  type AvatarType,
  generateDiceBearAvatar,
  generateInitials,
  getGradientClass,
  getAvatarSizeClasses
} from '@/lib/avatar-utils';

export interface AvatarProps {
  type?: AvatarType;
  data?: string;
  background?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

export default function Avatar({
  type,
  data,
  background,
  name,
  size = 'md',
  className = '',
  showBorder = false
}: AvatarProps) {
  const sizeClasses = getAvatarSizeClasses(size);
  const borderClass = showBorder ? 'ring-2 ring-white ring-offset-2' : '';

  const avatarContent = useMemo(() => {
    // If no type, generate default AI avatar
    if (!type || type === 'ai') {
      const seed = data || name || 'default';
      const style = background || 'adventurer';
      const avatarUrl = generateDiceBearAvatar(seed, style);

      return (
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      );
    }

    // Emoji avatar
    if (type === 'emoji') {
      const gradientClass = getGradientClass(background || 'purple');

      return (
        <div className={`w-full h-full flex items-center justify-center ${gradientClass}`}>
          <span className="text-current">{data || '🎁'}</span>
        </div>
      );
    }

    // Initials avatar
    if (type === 'initials') {
      const initials = data || generateInitials(name);
      const gradientClass = getGradientClass(background || 'purple');

      return (
        <div className={`w-full h-full flex items-center justify-center ${gradientClass} text-white font-bold`}>
          <span>{initials}</span>
        </div>
      );
    }

    // Photo avatar
    if (type === 'photo' && data) {
      return (
        <img
          src={data}
          alt={name}
          className="w-full h-full object-cover"
        />
      );
    }

    // Fallback: generate initials
    const initials = generateInitials(name);
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 text-white font-bold">
        <span>{initials}</span>
      </div>
    );
  }, [type, data, background, name]);

  return (
    <div
      className={`${sizeClasses} rounded-full overflow-hidden ${borderClass} ${className} flex-shrink-0`}
      title={name}
    >
      {avatarContent}
    </div>
  );
}

// Avatar Group component for showing multiple avatars
export interface AvatarGroupProps {
  avatars: Array<{
    type?: AvatarType;
    data?: string;
    background?: string;
    name: string;
  }>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  max?: number;
  className?: string;
}

export function AvatarGroup({
  avatars,
  size = 'sm',
  max = 3,
  className = ''
}: AvatarGroupProps) {
  const displayAvatars = avatars.slice(0, max);
  const remaining = Math.max(0, avatars.length - max);

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2">
        {displayAvatars.map((avatar, index) => (
          <Avatar
            key={index}
            {...avatar}
            size={size}
            showBorder
            className="transition-transform hover:scale-110 hover:z-10"
          />
        ))}
        {remaining > 0 && (
          <div
            className={`${getAvatarSizeClasses(size)} rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-white font-medium text-gray-600`}
          >
            +{remaining}
          </div>
        )}
      </div>
    </div>
  );
}
