# 🏠 Family Hub

**Your all-in-one platform for family management**

Family Hub combines two powerful systems to help you manage your family life more effectively:

- 🎁 **Gift Tracker** - Never forget a gift idea again with AI-powered recommendations and price tracking
- 🎯 **Accountability Platform** - Build responsibility through consequence tracking, commitments, and SMS integration

Built with Next.js, Supabase, and Claude AI.

---

## ✨ Features

### 🎁 Gift Tracker
- **Recipients Management** - Track birthdays, interests, and gift history for each person
- **Gift Tracking** - Organize gift ideas by status (Idea → Considering → Purchased → Given)
- **AI Price Tracking** - Automatic price lookup across Amazon, Target, Walmart, and more
- **Smart Recommendations** - Personalized gift suggestions powered by Claude AI
- **Budget Tracking** - Monitor spending and stay within budget
- **Analytics** - Insights into spending patterns and trends

### 🎯 Accountability Platform
- **Children Management** - Create profiles for each child with custom avatars
- **Consequences Tracking** - Track restrictions (devices, activities, privileges, locations) with automatic expiration
- **Commitments Tracking** - Monitor chores, homework, and responsibilities with reliability scoring
- **SMS Control** - Manage accountability via text messages with natural language processing
- **Advanced SMS Features**:
  - Multi-turn conversations with 30-minute context
  - Quick shortcuts (STATUS, HELP, STATS, etc.)
  - Bulk operations for multiple children
- **Comprehensive Analytics** - Reliability trends, consequence effectiveness, and pattern detection powered by AI
- **DAKboard Integration** - Wall-mounted display with auto-refresh for at-a-glance family status
- **Partner Features** - Two-parent coordination with notifications

---

## 📚 Documentation

- **[FEATURES.md](./FEATURES.md)** - Complete feature documentation (always up-to-date)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[SECURITY.md](./SECURITY.md)** - Security best practices and audit
- **[.env.example](./.env.example)** - Environment variables template

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com))
- Twilio account for SMS features ([twilio.com](https://twilio.com))

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd gift-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all required values:
- Supabase URL and keys
- Anthropic API key
- Twilio credentials (for SMS features)
- Cron secret (generate with `openssl rand -base64 32`)

4. **Set up the database**
```bash
# Push all migrations to your Supabase database
npx supabase db push

# Or run migrations individually from supabase/migrations/
```

5. **Seed dummy data (optional)**
```bash
# Start the dev server first
npm run dev

# In another terminal, seed accountability data
curl http://localhost:3000/api/seed/accountability
```

6. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🧪 SMS Testing (Local Development)

To test SMS features locally:

1. **Install ngrok** (if not already installed)
```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com
```

2. **Start ngrok tunnel**
```bash
# Terminal 1: Run the dev server
npm run dev

# Terminal 2: Create tunnel
ngrok http 3000
```

3. **Configure Twilio webhook**
   - Copy the ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`)
   - Go to Twilio Console → Phone Numbers → Your Number
   - Set webhook URL to: `https://abc123.ngrok.io/api/sms/receive`
   - Set method to `POST`

4. **Send test SMS**
   - Text your Twilio number: "STATUS" or "No iPad for Emma, 3 days, homework"
   - Check the console for Claude AI parsing and response

---

## 📦 Tech Stack

### Frontend
- **Next.js 14** (App Router, React Server Components)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** (via shadcn/ui) - Accessible components
- **Lucide Icons** - Icons
- **date-fns** - Date manipulation

### Backend
- **Next.js API Routes** - Serverless functions
- **Supabase** - PostgreSQL database + Auth
- **Anthropic Claude AI** - Natural language processing
- **Twilio** - SMS integration
- **Vercel Cron** - Scheduled tasks

### Database
- **PostgreSQL** (via Supabase)
- **Row Level Security (RLS)** - User-scoped data access
- **Stored Procedures** - Complex queries
- **Triggers** - Automatic updates

---

## 🏗️ Project Structure

```
gift-tracker/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── accountability/       # Accountability platform pages
│   │   │   ├── analytics/        # Analytics dashboard
│   │   │   ├── dakboard/         # Wall-mounted display
│   │   │   └── sms-guide/        # SMS commands documentation
│   │   ├── api/                  # API routes
│   │   │   ├── sms/              # SMS webhook
│   │   │   ├── cron/             # Scheduled tasks
│   │   │   └── accountability/   # Accountability APIs
│   │   ├── dashboard/            # Gift tracker dashboard
│   │   ├── recipients/           # Recipients management
│   │   ├── gifts/                # Gifts management
│   │   └── inspiration/          # AI recommendations
│   ├── components/               # React components
│   │   ├── accountability/       # Accountability components
│   │   ├── analytics/            # Analytics charts
│   │   ├── shared/               # Shared components
│   │   └── ui/                   # shadcn/ui components
│   ├── lib/                      # Utility functions
│   │   ├── services/             # Supabase service layer
│   │   ├── sms/                  # SMS processing logic
│   │   ├── analytics/            # Analytics calculations
│   │   └── supabase/             # Supabase clients
│   └── types/                    # TypeScript types
├── supabase/
│   └── migrations/               # Database migrations
├── FEATURES.md                   # Complete feature docs
├── DEPLOYMENT.md                 # Deployment guide
├── SECURITY.md                   # Security audit
└── .env.example                  # Environment template
```

---

## 🔒 Security

- **Authentication:** Supabase Auth with JWT tokens
- **Row Level Security:** User-scoped database access
- **API Security:** Input validation, rate limiting, CORS
- **SMS Security:** Twilio signature validation, phone whitelisting
- **Environment Variables:** Server-side secrets only

See [SECURITY.md](./SECURITY.md) for detailed security information.

---

## 📊 Database Schema

### Core Tables
- `profiles` - User profiles
- `recipients` - Gift recipients
- `gifts` - Gift ideas and purchases
- `children` - Child profiles
- `consequences` - Restrictions and consequences
- `commitments` - Tasks and responsibilities
- `commitment_stats` - Monthly reliability statistics
- `sms_context` - SMS conversation state (30-min TTL)
- `partner_settings` - Two-parent coordination

All tables have Row Level Security (RLS) enabled.

---

## 🤖 AI Integration

### Claude AI Features
- **SMS Parsing** - Natural language understanding for SMS commands
- **Gift Recommendations** - Personalized suggestions based on recipient profile
- **Price Lookup** - Web search and price extraction
- **Analytics Insights** - Pattern detection and parenting recommendations

### Model
- **Claude 3.5 Sonnet** (`claude-3-5-sonnet-20241022`)
- Context window: 200k tokens
- Function calling for structured outputs

---

## 📱 SMS Commands

Send text messages to control the accountability system:

### Shortcuts
- `STATUS` - Get current family status
- `HELP` - Show available commands
- `STATS` - View reliability statistics
- `CLEAR ALL` - Remove all consequences

### Natural Language
- "No iPad for Emma, 3 days, homework"
- "Jake can't have dessert for 2 days because attitude"
- "Emma committed to clean room by 5pm"
- "No TV for all kids, 1 day, fighting"

See `/accountability/sms-guide` for complete documentation.

---

## ⚙️ Automated Features

### Cron Jobs (Vercel)
- **Hourly:** Expire consequences, mark missed commitments, cleanup SMS contexts
- **Daily:** Send reminders (7 AM), calculate stats (midnight)

### Database Triggers
- Automatic `updated_at` timestamps
- Cascade deletes for child removal
- Stats recalculation on commitment changes

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import to Vercel**
3. **Add environment variables** (from `.env.local`)
4. **Configure cron jobs** (already in `vercel.json`)
5. **Deploy!**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 🔧 Development

### Available Scripts
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler
```

### Database Migrations
```bash
# Create new migration
npx supabase migration new migration_name

# Apply migrations
npx supabase db push
```

---

## 📖 Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub](https://github.com/vercel/next.js)

### Supabase Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Claude AI Resources
- [Anthropic Documentation](https://docs.anthropic.com)
- [Claude API Reference](https://docs.anthropic.com/claude/reference)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component-based architecture

---

## 📝 License

This project is private and proprietary.

---

## 🙏 Acknowledgments

- **Next.js** - The React framework
- **Supabase** - Backend as a Service
- **Anthropic** - Claude AI
- **Twilio** - SMS platform
- **Vercel** - Hosting and deployment
- **shadcn/ui** - Beautiful UI components

---

## 📧 Support

- **Documentation:** [FEATURES.md](./FEATURES.md)
- **Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Security:** [SECURITY.md](./SECURITY.md)
- **Issues:** GitHub Issues
- **Feature Requests:** GitHub Discussions

---

**© 2025 Family Hub. Built with Next.js, Supabase, and Claude AI.**
