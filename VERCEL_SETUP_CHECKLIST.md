# ✅ GiftStash Vercel Setup - Action Checklist

**Use this checklist while setting up your GiftStash deployment.**

---

## 🎯 What You're Doing

Creating a second Vercel deployment from the same repository:
- **Existing**: Family Hub deployment
- **New**: GiftStash deployment (giftstash.app)
- **Difference**: One environment variable changes everything!

---

## 📝 Step 1: Create Vercel Project

[ ] 1. Go to https://vercel.com/dashboard
[ ] 2. Click "Add New" → "Project"
[ ] 3. Find `gift-tracker` repository
[ ] 4. Click "Import"
[ ] 5. **STOP** - Don't deploy yet! Continue to Step 2

---

## 🔑 Step 2: Add Environment Variables

**Add this variable FIRST (the critical one):**

[ ] 6. Name: `NEXT_PUBLIC_APP_MODE`
[ ] 7. Value: `giftstash` (exactly, lowercase)
[ ] 8. Check all 3 environments: ✓ Production ✓ Preview ✓ Development

**Now copy these from your Family Hub Vercel project:**

Open Family Hub → Settings → Environment Variables in another tab

[ ] 9. `NEXT_PUBLIC_SUPABASE_URL` (copy value exactly)
[ ] 10. `NEXT_PUBLIC_SUPABASE_ANON_KEY` (copy value exactly)
[ ] 11. `SUPABASE_SERVICE_ROLE_KEY` (copy value exactly)
[ ] 12. `ANTHROPIC_API_KEY` (copy value exactly)
[ ] 13. `TWILIO_ACCOUNT_SID` (copy value exactly)
[ ] 14. `TWILIO_AUTH_TOKEN` (copy value exactly)
[ ] 15. `TWILIO_PHONE_NUMBER` (copy value exactly)
[ ] 16. `CRON_SECRET` (copy value exactly)
[ ] 17. `EMAIL_ENCRYPTION_KEY` (copy value exactly)

**Double-check:**
[ ] 18. All variables have all 3 environments checked
[ ] 19. `NEXT_PUBLIC_APP_MODE` = `giftstash` (not family-hub)
[ ] 20. No typos in variable names (case-sensitive!)

---

## 🚀 Step 3: Deploy

[ ] 21. Click "Deploy" button
[ ] 22. Wait 2-3 minutes for build
[ ] 23. Build completes successfully (check for errors)
[ ] 24. Click "Continue to Dashboard"

---

## 🌐 Step 4: Add Domain

**In your new GiftStash Vercel project:**

[ ] 25. Go to Settings → Domains
[ ] 26. Click "Add"
[ ] 27. Enter: `giftstash.app`
[ ] 28. Click "Add"
[ ] 29. Note the DNS instructions Vercel shows

---

## 🔧 Step 5: Configure DNS

**Go to your domain registrar (where you bought giftstash.app):**

[ ] 30. Find DNS settings / DNS records
[ ] 31. Add A Record:
       - Type: `A`
       - Host: `@` (or leave blank)
       - Value: `76.76.21.21`
       - TTL: `3600` (or Auto)
[ ] 32. Add CNAME Record:
       - Type: `CNAME`
       - Host: `www`
       - Value: `cname.vercel-dns.com`
       - TTL: `3600` (or Auto)
[ ] 33. Save DNS changes

---

## ⏳ Step 6: Wait for DNS

[ ] 34. Wait 5-15 minutes (can take up to 48 hours)
[ ] 35. Check Vercel → Domains tab
[ ] 36. Wait until status shows "Valid" ✓
[ ] 37. SSL certificate shows "Active" ✓

---

## ✅ Step 7: Verify Everything Works

**Visit https://giftstash.app and check:**

[ ] 38. GiftStash landing page appears (not Family Hub)
[ ] 39. Logo looks crisp and clear
[ ] 40. "Sign Up Free" button visible in header
[ ] 41. "Log In" button visible in header
[ ] 42. Hero section: "Never Forget a Gift Idea Again"
[ ] 43. "How It Works" section with 3 steps
[ ] 44. Features section with 6 features
[ ] 45. Footer with Privacy, Terms, Contact links

**Test Authentication:**

[ ] 46. Click "Sign Up Free"
[ ] 47. Create new test account
[ ] 48. Receive confirmation email
[ ] 49. Can log in successfully
[ ] 50. Redirected to `/dashboard` after login
[ ] 51. Dashboard shows GiftStash features

**Verify Family Hub Still Works:**

[ ] 52. Visit your Family Hub URL
[ ] 53. Family Hub homepage still appears
[ ] 54. All features still work
[ ] 55. Can log in with same account

---

## 🎉 Success!

When all items are checked:
- ✅ GiftStash is live at giftstash.app
- ✅ Family Hub continues working normally
- ✅ Both share same database and users
- ✅ You can log in to either with same account

---

## 🚨 If Something Goes Wrong

**Landing page not showing:**
- Re-check `NEXT_PUBLIC_APP_MODE=giftstash` in Vercel
- Redeploy: Deployments → ••• → Redeploy
- Clear browser cache (Cmd+Shift+R)

**Domain not working:**
- Wait 15 more minutes for DNS
- Check DNS records in registrar
- Use `dig giftstash.app` to verify DNS
- Try incognito/private browsing

**Can't log in:**
- Verify Supabase variables are correct
- Check they match Family Hub exactly
- Add `https://giftstash.app` to Supabase auth URLs

**See GIFTSTASH_SETUP.md for detailed troubleshooting**

---

**Total Steps**: 55
**Estimated Time**: 15-30 minutes (plus DNS wait)
**Difficulty**: Easy (just follow the steps!)

---

**Ready? Start with Step 1! 🚀**
