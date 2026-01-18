# Personality Survey Feature Guide

## Overview

The Personality Survey is an AI-powered feature that helps you build comprehensive recipient profiles automatically. By answering a series of questions about the recipient, our AI analyzes the responses along with their existing profile data to generate intelligent profile updates.

## How It Works

### 1. **Take the Survey** ✨
- Navigate to any recipient's detail page
- Click the **"✨ Take Personality Survey"** button
- Answer 15-20 questions across 4 categories:
  - **Lifestyle & Interests**: What they do, what they're passionate about
  - **Shopping Preferences**: Where they shop, their style, quality preferences
  - **Gift Style**: What types of gifts they appreciate, what to avoid
  - **Personal Details**: Colors, current interests, restrictions

### 2. **AI Analysis** 🤖
- Survey responses are sent to Claude AI (Sonnet 4.5)
- AI analyzes responses + existing profile data + previous surveys
- Generates comprehensive profile suggestions in 10-20 seconds
- Intelligently merges new insights with existing information

### 3. **Review & Apply** ✅
- Review AI-generated suggestions in an easy-to-read format
- Select which fields you want to update (all selected by default)
- See exactly what will be added before applying
- Click "Apply Selected Updates" to merge with existing profile

### 4. **Continuous Improvement** 🔄
- Run the survey multiple times as you learn more
- Each survey builds on previous ones
- AI recognizes patterns and refines recommendations
- Profile becomes more accurate over time

## Survey Questions

### Lifestyle & Interests (3 questions)
- **Free Time Activities**: Reading, gaming, outdoor activities, cooking, etc.
- **Passion Themes**: Technology, fashion, food, nature, pop culture, etc.
- **Personality Type**: Adventurous, practical, creative, minimalist, etc.

### Shopping Preferences (4 questions)
- **Where They Shop**: Online, boutiques, department stores, Etsy, etc.
- **Favorite Brands**: Optional text field for specific brands
- **Quality vs. Quantity**: 1-5 scale
- **Style Preference**: Modern, classic, bohemian, vintage, etc.

### Gift Style (5 questions)
- **Gift Type Preferences**: Practical, experiences, personalized, tech, etc.
- **Meaningful vs. Fun**: 1-5 scale
- **Experience vs. Physical**: 1-5 scale
- **Things to Avoid**: Clothing, perfume, clutter, food restrictions, etc.
- **Surprise Preference**: How they feel about surprises

### Personal Details (4 questions)
- **Favorite Colors**: Free text
- **Current Interests**: What they're currently into or collecting
- **Dietary Restrictions**: Allergies, preferences
- **Items Already Owned**: Things to avoid duplicating

## What Gets Updated

The AI can intelligently update these profile fields:

| Field | Type | How It's Merged |
|-------|------|-----------------|
| **Interests** | Array | Merges with existing, removes duplicates |
| **Hobbies** | Array | Merges with existing, removes duplicates |
| **Favorite Colors** | Array | Merges with existing, removes duplicates |
| **Favorite Brands** | Array | Adds NEW brands discovered in survey |
| **Favorite Stores** | Array | Adds NEW stores discovered in survey |
| **Gift Preferences** | Text | Replaces with comprehensive new description |
| **Gift Do's** | Array | Expands based on survey responses |
| **Gift Don'ts** | Array | Expands based on survey responses |
| **Restrictions** | Array | Adds dietary/allergy information |
| **Items Already Owned** | Array | Adds items to avoid |
| **Notes** | Text | Appends AI insights with timestamp |

### Bonus: AI Recommendations
The AI also provides:
- **Profile Summary**: 2-3 sentence personality overview
- **Gift Recommendations**: 5-7 specific gift category suggestions

## Database Structure

### `personality_surveys` Table
```sql
- id: UUID
- user_id: UUID (ref: auth.users)
- recipient_id: UUID (ref: recipients)
- survey_version: TEXT (currently 'v1')
- responses: JSONB (all survey answers)
- profile_suggestions: JSONB (AI-generated updates)
- applied: BOOLEAN (whether suggestions were applied)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## Files Created

### Database
- `supabase/migrations/add_personality_surveys.sql` - Database schema

### Survey System
- `src/lib/survey-questions.ts` - Survey questions and structure
- `src/components/PersonalitySurveyModal.tsx` - Multi-step survey form
- `src/components/ProfileSuggestionsModal.tsx` - Review/apply suggestions

### API
- `src/app/api/analyze-survey/route.ts` - AI analysis endpoint

### Integration
- Modified `src/app/recipients/[id]/page.tsx` - Added survey button and flow

## Usage Example

### Step 1: Start the Survey
```typescript
// User clicks "Take Personality Survey" button
// PersonalitySurveyModal opens
```

### Step 2: Answer Questions
```
Category: Lifestyle & Interests (1 of 4)
Question 1: What does this person typically do in their free time?
☑ Reading books/magazines
☑ Cooking & baking
☑ Travel & exploration

[Next →]
```

### Step 3: AI Analysis
```
After completing all categories, survey is submitted:
POST /api/analyze-survey
{
  recipientId: "...",
  surveyResponses: {
    lifestyle_activities: ["Reading books/magazines", "Cooking & baking"],
    favorite_colors: "blue, emerald green",
    ...
  }
}

AI analyzes responses + existing profile → generates suggestions
```

### Step 4: Review Suggestions
```
Profile Summary:
"A creative homebody who loves quality time in the kitchen and
exploring new recipes. Values experiences and handmade items over
mass-produced goods."

Suggested Updates:
✅ Interests: [+3 new items]
✅ Favorite Stores: [+2 new stores]
✅ Gift Do's: [+5 new preferences]
...

[Select all] [Deselect all]
[Apply Selected Updates →]
```

### Step 5: Results
```
✓ Profile updated successfully! 🎉

Profile now includes:
- 15 interests (was 5)
- 8 favorite stores (was 2)
- Comprehensive gift preferences
- Detailed notes about personality
```

## Best Practices

### For Best Results:
1. **Be Specific**: In text fields, provide specific brands, colors, interests
2. **Answer Honestly**: The more accurate, the better the recommendations
3. **Run Regularly**: Update as you learn more about the recipient
4. **Review Before Applying**: Check suggestions to ensure accuracy
5. **Combine with Manual Edits**: Use survey alongside manual profile updates

### Survey Timing:
- **Initial Profile**: Run immediately after creating a recipient
- **Before Holidays**: Update 1-2 months before major gift-giving occasions
- **After Learning More**: Anytime you discover new information
- **Quarterly Updates**: Keep profiles fresh with regular surveys

## Technical Details

### AI Model: Claude 3.5 Sonnet
- **Why**: Best balance of speed, accuracy, and cost
- **Max Tokens**: 4000 (comprehensive analysis)
- **Average Time**: 10-20 seconds per analysis

### Prompt Engineering
The AI receives:
- Current recipient profile (all fields)
- New survey responses
- Previous surveys (up to 3 most recent)
- Instructions to merge intelligently, not replace

### Data Privacy
- Survey responses stored securely in Supabase
- Row Level Security (RLS) ensures users only see their own surveys
- AI analysis happens server-side with Anthropic API
- No data shared with third parties

## Migration Required

**Before using this feature**, run this SQL in your Supabase Dashboard:

```sql
-- Run this in Supabase SQL Editor
-- This creates the personality_surveys table

-- Copy contents from: supabase/migrations/add_personality_surveys.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

## Troubleshooting

### Survey doesn't analyze
- **Check**: ANTHROPIC_API_KEY is set in environment variables
- **Check**: API key has sufficient credits
- **Check**: Database migration was applied

### Suggestions seem off
- **Solution**: Review and deselect inaccurate fields
- **Solution**: Provide more specific details in text fields
- **Solution**: Run survey again with better responses

### Profile not updating
- **Check**: You clicked "Apply Selected Updates"
- **Check**: At least one field was selected
- **Check**: Database connection is working
- **Check**: No constraint violations in console

## Future Enhancements

Potential features for future versions:
- **Survey Templates**: Pre-built surveys for different age groups
- **Voice Input**: Answer questions verbally
- **Image Upload**: Show pictures of their style/interests
- **Survey Scheduling**: Automatic reminders to update profiles
- **Survey Analytics**: See how profiles evolve over time
- **Multi-Person Surveys**: Get input from multiple people

## Questions?

This feature leverages AI to make gift-giving easier and more thoughtful. The more you use it, the better your recipient profiles become!

---

**Generated with**: Claude Code 🤖
**Feature Version**: v1.0
**Last Updated**: November 2025
