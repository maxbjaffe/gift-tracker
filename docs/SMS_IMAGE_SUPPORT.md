# SMS/MMS Image Support for GiftStash

## Overview

GiftStash now supports sending gift ideas via MMS (text with images)! Users can snap a photo of a product and text it to save gift ideas instantly.

## How It Works

### 1. User Experience
```
User: *Takes photo of LEGO set* + texts "LEGO set for Mom"
      OR
      *Takes photo with visible price tag*
      OR
      *Just sends product screenshot from Amazon*

GiftStash: ✓ Gift saved: "LEGO Star Wars Millennium Falcon" ($159.99) for Mom + 1 image(s).
            View at https://giftstash.app/gifts
```

### 2. Technical Flow

**When user sends MMS:**
1. Twilio webhook receives the message with `NumMedia` and `MediaUrl` fields
2. Our API downloads the image(s) from Twilio's temporary URLs
3. **Vision AI Analysis**: Claude 3.5 Sonnet analyzes the image to extract:
   - Product name/description
   - Price (if visible in image)
   - Category
   - Any other relevant details
4. **Storage**: Images are uploaded to Supabase Storage bucket `gift-images`
5. **Gift Creation**: Gift record is created with:
   - AI-extracted product info
   - `image_url` pointing to stored image
   - Metadata including original Twilio URLs
6. **Confirmation**: User receives SMS confirmation

## Implementation Details

### Vision AI Integration

Uses Claude 3.5 Sonnet with multimodal input:
```typescript
const contentArray = [
  {
    type: 'image',
    source: {
      type: 'base64',
      media_type: 'image/jpeg',
      data: base64EncodedImage
    }
  },
  {
    type: 'text',
    text: 'Extract gift information from this image...'
  }
]
```

### Supabase Storage Structure

**Bucket**: `gift-images` (public)
**Path**: `sms-gifts/{userId}/{timestamp}-{index}.{ext}`
**Example**: `sms-gifts/abc123/1732334567000-0.jpg`

### Database Schema

**gifts table** - Updated fields:
- `image_url`: Public URL to stored image (first image if multiple)
- `source_metadata.stored_image_urls[]`: Array of all stored image URLs
- `source_metadata.analyzed_with_vision`: Boolean flag
- `source_metadata.media_urls[]`: Original Twilio temporary URLs (expire after 7 days)

## Supabase Setup Required

### 1. Create Storage Bucket

```sql
-- Create the gift-images bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gift-images', 'gift-images', true);
```

### 2. Set Storage Policies

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Users can upload gift images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gift-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to read their own images
CREATE POLICY "Users can read own gift images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'gift-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access for image URLs
CREATE POLICY "Public can read gift images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gift-images');
```

## Features

### ✅ Supported
- Single or multiple images per message
- Image + text combination
- Image-only messages
- JPEG, PNG, GIF formats
- Price detection from images
- Product identification
- Automatic categorization
- Image storage with public URLs
- Vision AI analysis with Claude 3.5 Sonnet

### 🚧 Limitations
- Twilio temporary URLs expire after 7 days (we store permanently in Supabase)
- Max image size determined by Twilio limits
- Vision AI works best with clear product photos
- Requires good lighting and product visibility

## Testing

### Test Messages
```
# Image + text
*Photo of AirPods* + "For Sarah - $249"

# Image only
*Screenshot of Amazon product page*

# Multiple images
*Photo 1* + *Photo 2* + "Birthday gift for Dad"

# Image with URL
*Product photo* + "https://amazon.com/dp/B08N5WRWNW"
```

### Expected Responses

**Success:**
```
✓ Gift saved: "Apple AirPods Pro" ($249) for Sarah + 1 image(s).
View at https://giftstash.app/gifts
```

**No gift detected:**
```
I received your image but couldn't identify the gift.
Please text a description like: "LEGO set for Mom"
```

## Error Handling

1. **Image download fails**: Continues without image, processes text only
2. **Vision AI fails**: Falls back to text-only analysis
3. **Storage upload fails**: Logs error, saves gift without image
4. **No gift info extracted**: Sends helpful error message to user

## Monitoring

Check logs for:
```
[SMS] Received X image(s). Processing with Vision AI...
[Vision] ✓ Successfully used model: claude-3-5-sonnet-20241022
[Storage] ✓ Stored image 0: https://...supabase.co/storage/v1/object/public/gift-images/...
```

## Future Enhancements

- [ ] OCR for gift cards and receipts
- [ ] Multi-image gallery view in app
- [ ] Image compression/optimization
- [ ] Price tracking from product images
- [ ] Reverse image search for product matching
- [ ] Barcode/QR code scanning
