# Avatar System Integration Guide

## Quick Setup

### Step 1: Run Database Migrations

Go to your Supabase Dashboard SQL Editor and run:

```sql
-- Copy contents from database_schema_updates.sql
```

### Step 2: Update Recipient Forms

#### A) For `/app/recipients/new/page.tsx`

**1. Add imports at the top:**
```typescript
import AvatarSelector from '@/components/AvatarSelector';
import type { AvatarData } from '@/components/AvatarSelector';
import { generateDefaultAvatar } from '@/lib/avatar-utils';
```

**2. Add avatar state to formData:**
```typescript
const [avatar, setAvatar] = useState<AvatarData | null>(null);

// Initialize default avatar when name changes
useEffect(() => {
  if (formData.name && !avatar) {
    setAvatar(generateDefaultAvatar(formData.name));
  }
}, [formData.name]);
```

**3. Add avatar to the Supabase insert:**
```typescript
const { data, error } = await supabase
  .from('recipients')
  .insert({
    // ...existing fields...
    avatar_type: avatar?.type || null,
    avatar_data: avatar?.data || null,
    avatar_background: avatar?.background || null,
  })
  .select()
  .single();
```

**4. Add AvatarSelector to the form UI (after name field):**
```tsx
{/* Avatar Selection */}
<div className="bg-white p-6 rounded-xl shadow-sm">
  <label className="block text-sm font-medium text-gray-700 mb-4">
    Choose Avatar
  </label>
  <AvatarSelector
    name={formData.name}
    currentAvatar={avatar}
    onChange={setAvatar}
  />
</div>
```

#### B) For `/app/recipients/[id]/edit/page.tsx`

Same changes as above, but also:

**1. Load avatar from existing recipient:**
```typescript
useEffect(() => {
  if (recipient) {
    setFormData({
      // ...existing fields...
    });

    // Load avatar if exists
    if (recipient.avatar_type) {
      setAvatar({
        type: recipient.avatar_type,
        data: recipient.avatar_data || '',
        background: recipient.avatar_background || ''
      });
    } else {
      // Generate default if none exists
      setAvatar(generateDefaultAvatar(recipient.name));
    }
  }
}, [recipient]);
```

**2. Include avatar in the update:**
```typescript
const { error } = await supabase
  .from('recipients')
  .update({
    // ...existing fields...
    avatar_type: avatar?.type || null,
    avatar_data: avatar?.data || null,
    avatar_background: avatar?.background || null,
  })
  .eq('id', params.id);
```

### Step 3: Display Avatars

#### On Recipient List (`/app/recipients/page.tsx`)

**1. Add import:**
```typescript
import Avatar from '@/components/Avatar';
```

**2. Replace or add to recipient cards:**
```tsx
<div className="flex items-center space-x-4">
  <Avatar
    type={recipient.avatar_type}
    data={recipient.avatar_data}
    background={recipient.avatar_background}
    name={recipient.name}
    size="md"
    showBorder
  />
  <div>
    <h3 className="font-semibold">{recipient.name}</h3>
    <p className="text-sm text-gray-500">{recipient.relationship}</p>
  </div>
</div>
```

#### On Recipient Detail (`/app/recipients/[id]/page.tsx`)

**1. Add large avatar to header:**
```tsx
<div className="flex items-center space-x-6">
  <Avatar
    type={recipient.avatar_type}
    data={recipient.avatar_data}
    background={recipient.avatar_background}
    name={recipient.name}
    size="xl"
    showBorder
  />
  <div>
    <h1 className="text-4xl font-bold text-gray-900 mb-2">
      {recipient.name}
    </h1>
    {/* ...rest of header... */}
  </div>
</div>
```

#### On Gift Cards

**1. Add small recipient avatars:**
```tsx
<div className="flex items-center gap-2">
  <Avatar
    type={gift.recipient_avatar_type}
    data={gift.recipient_avatar_data}
    background={gift.recipient_avatar_background}
    name={gift.recipient_name}
    size="xs"
  />
  <span className="text-sm text-gray-600">
    For {gift.recipient_name}
  </span>
</div>
```

### Step 4: Update TypeScript Interfaces

Add avatar fields to recipient interfaces:

```typescript
interface Recipient {
  id: string;
  name: string;
  // ...existing fields...
  avatar_type?: 'ai' | 'emoji' | 'initials' | 'photo' | null;
  avatar_data?: string | null;
  avatar_background?: string | null;
  personality_type?: string | null;
}
```

## Testing

1. Create a new recipient and choose an avatar
2. Edit an existing recipient and change their avatar
3. View recipient list - avatars should show on cards
4. View recipient detail - large avatar in header
5. View gifts - small recipient avatars on gift cards

## Troubleshooting

**Avatars not showing:**
- Check database migrations ran successfully
- Verify avatar_type, avatar_data, avatar_background columns exist
- Check browser console for errors
- Verify DiceBear API is accessible (https://api.dicebear.com)

**Default avatars not generating:**
- Ensure `generateDefaultAvatar` is called when name changes
- Check that name field has a value before avatar renders

**Photo uploads not working:**
- File size limit is 2MB
- Base64 encoding may increase size
- Consider using Supabase Storage for large files

## Next Steps

Once avatars are working:
1. Add avatar quick-edit on hover
2. Build the Calendar feature with avatar badges
3. Implement Personality Quiz with avatar integration
4. Create AI Chat with avatars in messages

## Pro Tips

- Avatars auto-generate from names by default
- Users can regenerate AI avatars for fun variations
- Emoji + gradient combos create unique looks
- Initials work great for professional feel
- Photos add personal touch

Enjoy your new avatar system! 🎨✨
