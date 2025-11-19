/**
 * ChildAvatar Component
 * Wrapper around Avatar component specifically for displaying child avatars
 */

import Avatar from './Avatar';

export interface ChildAvatarProps {
  name: string;
  avatarType?: string | null;
  avatarData?: string | null;
  avatarBackground?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

export function ChildAvatar({
  name,
  avatarType,
  avatarData,
  avatarBackground,
  size = 'md',
  className = '',
  showBorder = false
}: ChildAvatarProps) {
  return (
    <Avatar
      type={(avatarType as 'preset' | 'emoji' | undefined) || 'preset'}
      data={avatarData || undefined}
      background={avatarBackground || undefined}
      name={name}
      size={size}
      className={className}
      showBorder={showBorder}
    />
  );
}
