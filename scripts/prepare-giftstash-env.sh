#!/bin/bash

# Script to help prepare GiftStash environment variables
# This creates a .env.giftstash file you can use with Vercel CLI

echo "🎯 GiftStash Environment Variable Setup"
echo "========================================"
echo ""

# Check if .env.local exists (Family Hub config)
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found"
    echo "   This script needs your existing .env.local to copy values from"
    echo "   Please create .env.local first with your Family Hub values"
    exit 1
fi

echo "✅ Found .env.local (Family Hub config)"
echo ""

# Create .env.giftstash from .env.local
echo "📝 Creating .env.giftstash for GiftStash deployment..."
echo ""

# Start with the critical GiftStash variable
echo "# GiftStash Deployment Environment Variables" > .env.giftstash
echo "# Generated from .env.local on $(date)" >> .env.giftstash
echo "" >> .env.giftstash
echo "# CRITICAL: GiftStash-specific variable" >> .env.giftstash
echo "NEXT_PUBLIC_APP_MODE=giftstash" >> .env.giftstash
echo "" >> .env.giftstash

# Copy all other variables from .env.local (except NEXT_PUBLIC_APP_MODE)
echo "# Variables copied from Family Hub deployment" >> .env.giftstash
grep -v "^#" .env.local | grep -v "^$" | grep -v "NEXT_PUBLIC_APP_MODE" >> .env.giftstash

echo "✅ Created .env.giftstash"
echo ""

# Verify critical variables
echo "🔍 Verifying required variables..."
REQUIRED_VARS=(
    "NEXT_PUBLIC_APP_MODE"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "ANTHROPIC_API_KEY"
)

ALL_PRESENT=true
for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" .env.giftstash; then
        echo "✅ $var"
    else
        echo "❌ $var MISSING"
        ALL_PRESENT=false
    fi
done

echo ""
echo "========================================"

if [ "$ALL_PRESENT" = true ]; then
    echo "✅ All required variables present!"
    echo ""
    echo "Next steps:"
    echo "1. Review .env.giftstash to verify values"
    echo "2. Use Vercel CLI to upload:"
    echo "   vercel login"
    echo "   vercel link  (select your GiftStash project)"
    echo "   cat .env.giftstash | vercel env add production"
    echo "   cat .env.giftstash | vercel env add preview"
    echo "   cat .env.giftstash | vercel env add development"
    echo ""
    echo "Or follow VERCEL_ENV_UPLOAD.md for detailed instructions"
else
    echo "⚠️  Some required variables are missing"
    echo "   Check your .env.local file and try again"
fi

echo ""
echo "📖 See VERCEL_ENV_UPLOAD.md for upload instructions"
