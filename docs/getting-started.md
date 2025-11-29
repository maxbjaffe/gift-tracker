# Getting Started with GiftStash

This guide will help you set up and run GiftStash on your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and npm
- **Git** for version control
- A **Supabase account** (free tier works) - [supabase.com](https://supabase.com)
- An **Anthropic API key** - [console.anthropic.com](https://console.anthropic.com)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gift-tracker
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- TypeScript
- Supabase client libraries
- Anthropic AI SDK
- Tailwind CSS and UI components

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure the following variables:

#### Required Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Anthropic Claude AI
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxx

# Application Configuration
NEXT_PUBLIC_APP_MODE=giftstash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Optional Variables

```bash
# Cron Jobs Authentication (for production)
CRON_SECRET=your-random-secret-key-here

# Email Encryption (if using email features)
EMAIL_ENCRYPTION_KEY=your-encryption-key-here
```

### 4. Set Up Supabase Database

#### Get Your Supabase Credentials

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy your project URL and anon key
4. Copy your service role key (keep this secret!)

#### Run Database Migrations

You have two options:

**Option A: Run the complete setup script**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `/Users/max.jaffe/gift-tracker/COMPLETE_DATABASE_SETUP.sql`
4. Paste and run in the SQL Editor

**Option B: Run migrations sequentially**

Run these migrations in order from the `supabase/migrations/` folder:

```bash
# Core GiftStash tables
20251124_gift_recipient_occasions.sql
20251124_recipient_budgets.sql
20251124_complete_multi_tenancy.sql

# Sharing and collaboration
20251126_sharing_and_reservations.sql

# Recommendation system
20251126_recommendation_feedback_system_v2.sql
```

### 5. Verify Database Setup

After running migrations, verify your tables exist:

```sql
-- Run in Supabase SQL Editor
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see these GiftStash tables:
- `recipients`
- `gifts`
- `gift_recipients`
- `recommendation_feedback`
- `trending_gifts`
- `share_views`

### 6. Configure Row Level Security (RLS)

RLS is automatically configured by the migration scripts. Verify policies are enabled:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('recipients', 'gifts', 'gift_recipients');
```

All tables should show `rowsecurity = true`.

### 7. Create Your First User

1. Start the development server (see below)
2. Navigate to `http://localhost:3000/signup`
3. Create an account with your email
4. Check your email for the confirmation link
5. Confirm your account and sign in

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

Build and run the production version:

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Linting and Type Checking

```bash
# Run ESLint
npm run lint

# Type check with TypeScript (if configured)
npm run type-check
```

## First-Time Configuration

### 1. Sign In and Create Your Profile

After creating your account:

1. Navigate to `/settings` to configure your profile
2. Set your display name and preferences
3. Configure notification settings

### 2. Create Your First Recipient

1. Go to `/recipients/new`
2. Fill in recipient details:
   - Name (required)
   - Relationship (required)
   - Birthday
   - Age range
   - Interests and hobbies
   - Favorite brands and stores
   - Budget limit
   - Gift preferences

3. Save the recipient

### 3. Add Your First Gift

1. Go to `/gifts/new`
2. Choose a method:
   - **URL Import**: Paste a product URL (Amazon, Target, etc.)
   - **Manual Entry**: Fill in details manually
   - **AI Recommendations**: Get suggestions based on recipient profile

3. Link the gift to one or more recipients
4. Set the status (Idea, Considering, Purchased, etc.)

### 4. Try AI Recommendations

1. Navigate to a recipient's detail page (`/recipients/[id]`)
2. Click "Get AI Recommendations"
3. Optionally filter by:
   - Category
   - Price range
   - Occasion
4. Review personalized gift suggestions
5. Add suggestions to your gift list with one click

## Understanding the App Structure

### Main Navigation

- **Dashboard** (`/dashboard`) - Overview of all gifts and recipients
- **Recipients** (`/recipients`) - Manage recipient profiles
- **Gifts** (`/gifts`) - View and manage all gifts
- **Budget Tracker** (`/recipients/budgets`) - Track spending per recipient
- **Analytics** (`/analytics`) - Insights and spending trends

### Gift Workflow

1. **Idea** - Initial gift idea
2. **Considering** - Evaluating the gift
3. **Purchased** - Gift has been bought
4. **Wrapped** - Gift is ready to give
5. **Given** - Gift has been delivered

### AI Features

- **Gift Recommendations** - Personalized suggestions based on recipient profiles
- **Chat Gift Finder** - Conversational interface for gift discovery
- **Product Extraction** - Automatic product info from URLs
- **Trending Insights** - Learn from successful gifts across all users

## Development Tips

### Hot Reload

Next.js automatically reloads when you make changes to:
- Page components (`.tsx` files in `/src/app`)
- API routes (`.ts` files in `/src/app/api`)
- Components (`.tsx` files in `/src/components`)
- Styles (`.css` files)

### API Testing

Test API endpoints using curl or Postman:

```bash
# Get all recipients (requires authentication)
curl http://localhost:3000/api/recipients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get AI recommendations
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"recipientId": "uuid-here"}'
```

### Database Access

Access your database via Supabase dashboard:

1. Go to your project at [app.supabase.com](https://app.supabase.com)
2. Navigate to Table Editor or SQL Editor
3. Query and manage your data

### Debugging

Enable verbose logging:

```bash
# Add to .env.local
DEBUG=true
```

Check browser console and terminal output for detailed logs.

## Common Issues

### "Unauthorized" Errors

- Ensure you're signed in
- Check that your Supabase URL and keys are correct
- Verify RLS policies are properly configured

### AI Recommendations Not Working

- Verify `ANTHROPIC_API_KEY` is set correctly
- Check you have API credits in your Anthropic account
- Review the API key has access to Claude models

### Database Connection Issues

- Confirm `NEXT_PUBLIC_SUPABASE_URL` matches your project URL
- Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Verify your Supabase project is active (not paused)

### Migration Errors

- Run migrations in the correct order
- Check for existing tables before re-running migrations
- Review Supabase logs for detailed error messages

## Next Steps

Now that you have GiftStash running:

1. Read the [Features Guide](./features.md) to learn about all capabilities
2. Review the [API Reference](./api-reference.md) for integration details
3. Check the [Database Documentation](./database.md) for schema information
4. Explore the [Architecture Guide](./architecture.md) to understand the system design

## Getting Help

If you encounter issues:

1. Check the documentation in this folder
2. Review error messages in browser console and terminal
3. Check Supabase logs in your project dashboard
4. Verify all environment variables are correctly set

## Production Deployment

Ready to deploy? See the main project README for deployment instructions to Vercel or other platforms.

Key considerations:
- Set all environment variables in your hosting platform
- Use production-grade Supabase instance
- Enable HTTPS for all endpoints
- Configure proper CORS settings
- Set up monitoring and error tracking

---

**Next**: [Features Guide](./features.md) | [API Reference](./api-reference.md)
