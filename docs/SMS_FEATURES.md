# SMS Features Documentation

## Overview
GiftStash supports full SMS interaction for gift tracking, including commands, onboarding, and automated reminders.

## Features

### 1. EXPORT Command
Users can text "EXPORT" to receive a formatted shopping list of all unpurchased gifts.

**Usage:**
```
Text: EXPORT
```

**Response Format:**
```
🛍️ SHOPPING LIST (5 items)

FOR MOM:
• LEGO Star Wars Set - $159.99 [Toys]
• Apple Watch - $399.00 [Electronics]

FOR DAD:
• Golf Club Set - $249.00 [Sports]

UNASSIGNED:
• Kindle Paperwhite - $139.99 [Electronics]
• Air Fryer - $89.99 [Home]

💰 Total: $1,037.97

View full details at https://giftstash.app/gifts
```

**Implementation:**
- Fetches all gifts with status 'idea' or 'considering'
- Groups by recipient
- Shows price, category for each gift
- Calculates total budget
- Truncates if message exceeds SMS limits (1500 chars)

### 2. HELP Command
Users can text "HELP" to see usage instructions.

**Usage:**
```
Text: HELP
```

**Response:**
```
📱 GIFTSTASH HELP

SAVE GIFTS:
Text gift ideas like:
• "LEGO set for Mom"
• "AirPods Pro for Sarah - $249"
• Send a product photo

COMMANDS:
• EXPORT - Get your shopping list
• HELP - Show this message

Visit https://giftstash.app to manage your gifts!
```

### 3. SMS Onboarding Sequence
New users receive an automated onboarding tutorial after their first gift save.

**Trigger:** First or second SMS message from a new user

**Onboarding Message:**
```
🎁 Welcome to GiftStash!

I'm your AI gift tracking assistant. Here's how I work:

📝 SAVE GIFTS:
Just text me gift ideas naturally:
• "LEGO set for Mom"
• "AirPods Pro - $249 for Sarah"
• Send a product photo

📱 COMMANDS:
• EXPORT - Get your shopping list
• HELP - Show commands

🌐 MANAGE ONLINE:
Visit https://giftstash.app to:
• View all gifts
• Add recipients
• Get AI suggestions

Try it now! Text a gift idea or send a product photo.
```

**Database:**
- `profiles.sms_onboarded` column tracks if user has been onboarded
- Set to `true` after first onboarding message sent

### 4. Birthday Reminder System
Automated SMS reminders sent at key intervals before recipient birthdays.

**Schedule:**
- **7 days before:** Week advance notice
- **1 day before:** Last chance reminder
- **Day of:** Happy birthday notification

**Cron Job:**
- Runs daily at 9:00 AM (EST)
- Configured in `vercel.json`: `"schedule": "0 9 * * *"`
- Endpoint: `/api/cron/birthday-reminders`

**Example Reminders:**

*7 Days Before:*
```
🎂 Reminder: Sarah's birthday is in 1 week (December 15)!

View gift ideas at https://giftstash.app/recipients/abc123
```

*1 Day Before:*
```
🎂 Reminder: Sarah's birthday is TOMORROW (December 15)!

Last chance to get a gift!
View ideas at https://giftstash.app/recipients/abc123
```

*Day Of:*
```
🎉 Happy Birthday to Sarah TODAY!

Don't forget to wish them well!
View gift ideas at https://giftstash.app/recipients/abc123
```

**Requirements:**
- User must have `phone_number` set in profile
- Recipient must have `birthday` field set
- Twilio credentials configured (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`)

## Setup

### Environment Variables
```bash
# Twilio (required for all SMS features)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Cron security (optional but recommended)
CRON_SECRET=your_random_secret_string

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key

# App URL (for links in SMS)
NEXT_PUBLIC_APP_URL=https://giftstash.app
```

### Database Migration
Run the migration to add the `sms_onboarded` column:

```sql
-- In Supabase SQL Editor
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS sms_onboarded BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_sms_onboarded ON profiles(sms_onboarded);
```

Or apply via Supabase CLI:
```bash
supabase db push
```

### Vercel Cron Configuration
The birthday reminder cron is automatically configured in `vercel.json`.

To set the `CRON_SECRET` in Vercel:
1. Go to Project Settings → Environment Variables
2. Add `CRON_SECRET` with a random secure value
3. Redeploy

## Testing

### Test EXPORT Command
```bash
# Send SMS to your Twilio number
Text: EXPORT
```

### Test HELP Command
```bash
Text: HELP
```

### Test Onboarding
1. Create a new user with a phone number
2. Ensure `sms_onboarded` is `false`
3. Send first gift idea via SMS
4. Should receive gift confirmation + onboarding message

### Test Birthday Reminders
```bash
# Manually trigger cron (for testing)
curl -X POST https://giftstash.app/api/cron/birthday-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or use Vercel dashboard to trigger the cron manually.

## Limitations

- SMS messages limited to ~1600 characters (we truncate EXPORT at 1500)
- Twilio free tier has message limits
- Birthday reminders require user phone numbers to be set
- Cron jobs run on Vercel's schedule (can have 1-2 minute variance)

## Future Enhancements

- [ ] Weekly summary SMS of all upcoming birthdays
- [ ] Reminder preferences (opt-in/out, timing customization)
- [ ] Budget alert SMS when spending exceeds limit
- [ ] Gift purchase confirmation via SMS reply
- [ ] Price drop alerts for tracked gifts
