# GiftStash Documentation

**Your intelligent gift tracking and recommendation system**

Welcome to the GiftStash documentation. This knowledge base provides comprehensive information about the GiftStash gift tracking platform, its features, architecture, and APIs.

## Table of Contents

1. [Getting Started](./getting-started.md)
   - Installation and setup
   - Environment variables
   - Running the application
   - First-time configuration

2. [Architecture](./architecture.md)
   - System overview
   - Technology stack
   - Directory structure
   - Design patterns

3. [API Reference](./api-reference.md)
   - Complete API endpoint documentation
   - Request/response examples
   - Authentication requirements
   - Error handling

4. [Features](./features.md)
   - Gift management
   - Recipient profiles
   - AI-powered recommendations
   - Budget tracking
   - Sharing and collaboration
   - Analytics and insights

5. [Database](./database.md)
   - Schema overview
   - Table relationships
   - Row Level Security (RLS)
   - Indexes and performance

## What is GiftStash?

GiftStash is an intelligent gift tracking platform that helps you:

- **Never forget a gift idea** - Capture gift ideas instantly from any URL or manual entry
- **Know your recipients** - Build detailed profiles with interests, preferences, and budgets
- **Get AI recommendations** - Receive personalized gift suggestions powered by Claude AI
- **Track your budget** - Monitor spending across all recipients and occasions
- **Share gift lists** - Collaborate with family and friends using shareable links
- **Prevent duplicates** - Claim system ensures no one buys the same gift twice

## Key Features

### Gift Management
- Track gifts through multiple statuses: Idea, Considering, Purchased, Wrapped, Given
- Automatic price extraction from product URLs
- Price history tracking
- Product image capture
- Multi-recipient support

### AI-Powered Intelligence
- Personalized gift recommendations based on recipient profiles
- Natural language chat interface for gift discovery
- Product information extraction from URLs
- Trending gift insights from user data
- Feedback-based learning system

### Recipient Profiles
- Comprehensive recipient information
- Interests, hobbies, and preferences
- Favorite brands and stores
- Budget tracking per recipient
- Birthday and occasion reminders
- Clothing sizes and wishlist items

### Sharing & Collaboration
- Share recipient gift lists with public links
- Anonymous gift claiming (no login required)
- Expiring share links
- View analytics for shared lists
- Email-based claim verification

## Quick Links

- **Installation Guide**: [getting-started.md](./getting-started.md)
- **API Documentation**: [api-reference.md](./api-reference.md)
- **Feature Overview**: [features.md](./features.md)
- **Database Schema**: [database.md](./database.md)

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **AI**: Anthropic Claude (Sonnet 4.5, Haiku 3)
- **Auth**: Supabase Auth (JWT-based)
- **Deployment**: Vercel

## Support & Resources

- **Environment Setup**: See [getting-started.md](./getting-started.md)
- **API Integration**: See [api-reference.md](./api-reference.md)
- **Database Migrations**: See [database.md](./database.md)
- **Feature Documentation**: See [features.md](./features.md)

## Contributing

For developers looking to contribute or extend GiftStash:

1. Read the [Architecture](./architecture.md) documentation to understand the system design
2. Review the [API Reference](./api-reference.md) for endpoint specifications
3. Check the [Database](./database.md) documentation for schema details
4. Follow the [Getting Started](./getting-started.md) guide to set up your development environment

## License

This project is private and proprietary.

---

**Last Updated**: November 2024
**Version**: 1.0.0
