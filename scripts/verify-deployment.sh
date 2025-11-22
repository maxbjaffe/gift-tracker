#!/bin/bash

# GiftStash Deployment Verification Script
# This script helps verify your deployment is configured correctly

echo "🔍 GiftStash Deployment Verification"
echo "======================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found"
    echo "   Create it from .env.example for local testing"
    echo ""
else
    echo "✅ .env.local exists"
fi

# Check app mode
if [ -f .env.local ]; then
    if grep -q "NEXT_PUBLIC_APP_MODE=giftstash" .env.local; then
        echo "✅ App mode set to GiftStash"
        MODE="giftstash"
    elif grep -q "NEXT_PUBLIC_APP_MODE=family-hub" .env.local; then
        echo "✅ App mode set to Family Hub"
        MODE="family-hub"
    else
        echo "⚠️  NEXT_PUBLIC_APP_MODE not found in .env.local"
        echo "   Will default to family-hub"
        MODE="family-hub"
    fi
else
    MODE="family-hub"
fi

echo ""

# Check required files exist
echo "📁 Checking required files..."
FILES=(
    "src/lib/app-config.ts"
    "src/components/landing/GiftStashLanding.tsx"
    "src/components/landing/FamilyHubHome.tsx"
    "public/images/GiftStashIconGSv2.png"
    "public/images/GiftStashFullLogoV2.png"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file MISSING"
    fi
done

echo ""

# Check environment variables
echo "🔐 Checking environment variables..."
REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "ANTHROPIC_API_KEY"
)

if [ -f .env.local ]; then
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" .env.local; then
            echo "✅ $var"
        else
            echo "❌ $var MISSING"
        fi
    done
else
    echo "⚠️  Skipped (no .env.local file)"
fi

echo ""
echo "======================================"
echo "Current mode: $MODE"
echo ""

if [ "$MODE" = "giftstash" ]; then
    echo "When you run 'npm run dev', you should see:"
    echo "  → GiftStash landing page"
    echo "  → 'Sign Up Free' and 'Log In' buttons"
    echo "  → No Family Hub header"
else
    echo "When you run 'npm run dev', you should see:"
    echo "  → Family Hub homepage"
    echo "  → Full navigation with all features"
    echo "  → Family Hub header"
fi

echo ""
echo "💡 To test GiftStash mode locally:"
echo "   1. Set NEXT_PUBLIC_APP_MODE=giftstash in .env.local"
echo "   2. Restart dev server: npm run dev"
echo "   3. Visit http://localhost:3000"
echo ""
echo "📖 See GIFTSTASH_SETUP.md for deployment instructions"
echo ""
