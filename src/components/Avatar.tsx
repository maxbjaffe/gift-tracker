// Avatar Display Component - Simplified and Optimized

'use client';

import { useState, useMemo } from 'react';
import {
  type AvatarType,
  type AvatarData,
  getPresetById,
  getGradientClass,
  getAvatarSizeClasses,
  getRandomPreset
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
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses = getAvatarSizeClasses(size);
  const borderClass = showBorder ? 'ring-2 ring-white ring-offset-2' : '';

  const avatarContent = useMemo(() => {
    // Preset avatar (new default)
    if (!type || type === 'preset') {
      const presetId = data || getRandomPreset().id;
      const preset = getPresetById(presetId);
      const avatarUrl = preset?.url || getRandomPreset().url;

      return (
        <div className="w-full h-full relative bg-gradient-to-br from-gray-100 to-gray-200">
          {/* Loading state - subtle pulse */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1/2 h-1/2 rounded-full bg-gray-300 animate-pulse" />
            </div>
          )}

          {/* Avatar image */}
          <img
            src={avatarUrl}
            alt={preset?.name || name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />

          {/* Error fallback - show first letter */}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 text-white font-bold">
              <span>{name?.[0]?.toUpperCase() || '?'}</span>
            </div>
          )}
        </div>
      );
    }

    // Emoji avatar
    if (type === 'emoji') {
      const gradientClass = getGradientClass(background || 'purple');

      return (
        <div className={`w-full h-full flex items-center justify-center ${gradientClass}`}>
          <span className="text-current select-none">{data || '🎁'}</span>
        </div>
      );
    }

    // Fallback: emoji with purple gradient
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600">
        <span className="text-current select-none">🎁</span>
      </div>
    );
  }, [type, data, background, name, imageError, imageLoaded]);

  return (
    <div
      className={`${sizeClasses} rounded-full overflow-hidden ${borderClass} ${className} flex-shrink-0 transition-transform duration-200`}
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
