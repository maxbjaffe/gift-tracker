# 🚀 Deployment Checklist - Family Accountability Platform

This checklist ensures a smooth deployment to production with all features working correctly.

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

Ensure all required environment variables are set in your production environment (Vercel):

#### **Supabase** (Required)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (secret)

#### **Anthropic Claude AI** (Required for SMS parsing)
- [ ] `ANTHROPIC_API_KEY` - Your Anthropic API key for Claude

#### **Twilio SMS** (Required for SMS features)
- [ ] `TWILIO_ACCOUNT_SID` - Twilio account SID
- [ ] `TWILIO_AUTH_TOKEN` - Twilio auth token
- [ ] `TWILIO_PHONE_NUMBER` - Your Twilio phone number (format: +1234567890)
- [ ] `TWILIO_SMS_WEBHOOK_URL` - Public webhook URL (e.g., https://yourdomain.com/api/sms/receive)

#### **Cron Jobs** (Required)
- [ ] `CRON_SECRET` - Secret key for authenticating cron job requests (generate with `openssl rand -base64 32`)

#### **Optional**
- [ ] `NEXT_PUBLIC_APP_URL` - Your app's production URL (for notifications)

### 2. Database Setup

#### **Supabase Database Migrations**

Apply all migrations in order:

```bash
# In Supabase SQL Editor, run these migrations in order:
1. add_user_id_to_tables.sql
2. update_avatar_type_constraint.sql
3. add_max_purchased_budget.sql
4. add_personality_surveys.sql
5. 20241114_create_profiles_with_phone.sql
6. 20241114_sms_tracking.sql
7. 20250116000000_accountability_system.sql
8. 20250117_sms_context.sql
```

#### **Verify Tables Created**

- [ ] `profiles` - User profiles with phone numbers
- [ ] `children` - Child records
- [ ] `consequences` - Restrictions and consequences
- [ ] `commitments` - Child commitments
- [ ] `commitment_stats` - Monthly reliability statistics
- [ ] `sms_messages` - SMS message logging
- [ ] `sms_context` - Conversation context (30-min expiry)

#### **Row Level Security (RLS)**

- [ ] Verify RLS is enabled on all tables
- [ ] Test that users can only see their own data
- [ ] Verify service role can bypass RLS for cron jobs

### 3. Twilio Configuration

#### **SMS Webhook Setup**

1. [ ] Go to Twilio Console → Phone Numbers → Active Numbers
2. [ ] Select your phone number
3. [ ] Under "Messaging Configuration":
   - [ ] Set "A MESSAGE COMES IN" webhook to: `https://yourdomain.com/api/sms/receive`
   - [ ] Method: `POST`
   - [ ] Content Type: `application/x-www-form-urlencoded`
4. [ ] Save configuration
5. [ ] Test by sending a text message

#### **Phone Number Registration**

- [ ] Complete A2P 10DLC registration (required for US numbers)
- [ ] Register your use case with carriers
- [ ] Wait for approval (can take 1-2 weeks)

### 4. Vercel Deployment

#### **Cron Jobs Configuration**

Verify `vercel.json` includes all cron jobs:

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-consequences",
      "schedule": "*/15 * * * *"  // Every 15 minutes
    },
    {
      "path": "/api/cron/commitment-reminders",
      "schedule": "*/5 * * * *"  // Every 5 minutes
    },
    {
      "path": "/api/cron/consequence-warnings",
      "schedule": "*/30 * * * *"  // Every 30 minutes
    },
    {
      "path": "/api/cron/calculate-reliability",
      "schedule": "0 1 * * *"  // Daily at 1 AM
    },
    {
      "path": "/api/cron/weekly-report",
      "schedule": "0 18 * * 0"  // Sundays at 6 PM
    },
    {
      "path": "/api/cron/cleanup-sms-context",
      "schedule": "0 * * * *"  // Every hour
    }
  ]
}
```

#### **Deployment Steps**

1. [ ] Push code to GitHub
2. [ ] Deploy to Vercel (automatic on push to main)
3. [ ] Set all environment variables in Vercel dashboard
4. [ ] Wait for deployment to complete
5. [ ] Verify deployment URL is accessible

### 5. Post-Deployment Verification

#### **Basic Functionality**

- [ ] Homepage loads without errors
- [ ] User can sign up with email
- [ ] User can sign in
- [ ] Dashboard displays correctly
- [ ] Can add a child
- [ ] Can view accountability dashboard

#### **SMS Features**

- [ ] Send "HELP" → Receives command list
- [ ] Send "STATUS" → Receives status summary
- [ ] Send consequence (e.g., "No iPad 3 days Emma - homework") → Creates consequence
- [ ] Send commitment (e.g., "Emma will finish homework by 7pm") → Creates commitment
- [ ] Send bulk operation (e.g., "No TV for all kids 2 days") → Applies to all children
- [ ] Verify SMS context persists for 30 minutes

#### **Cron Jobs**

After deployment, verify cron jobs are running:

1. [ ] Check Vercel → Deployments → Functions → Cron
2. [ ] Wait for each cron schedule to trigger
3. [ ] Verify logs show successful execution
4. [ ] Test manually by calling with authorization header:
   ```bash
   curl -X GET https://yourdomain.com/api/cron/test \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

#### **Analytics**

- [ ] Visit `/accountability/analytics`
- [ ] Verify charts load without errors
- [ ] Check that reliability scores calculate correctly
- [ ] Verify pattern detection works

#### **Partner Notifications**

- [ ] Create a consequence → Verify partner receives notification
- [ ] Confirm consequence → Verify both parents notified
- [ ] Lift consequence → Verify both parents notified

### 6. Security Audit

#### **Authentication**

- [ ] Verify all API routes require authentication
- [ ] Check that unauthenticated requests return 401
- [ ] Verify JWT tokens expire correctly
- [ ] Test that users can't access other users' data

#### **API Security**

- [ ] Verify cron endpoints require `CRON_SECRET`
- [ ] Check SMS webhook validates Twilio signature (if implemented)
- [ ] Verify service role key is not exposed in client code
- [ ] Check that error messages don't leak sensitive information

#### **Input Validation**

- [ ] Test SQL injection on all inputs (should be prevented by Supabase)
- [ ] Test XSS on text inputs (should be sanitized)
- [ ] Verify phone numbers are validated
- [ ] Check that dates/times are validated

#### **Rate Limiting**

- [ ] Consider adding rate limiting for SMS webhook
- [ ] Consider rate limiting for API endpoints
- [ ] Monitor Anthropic API usage to prevent unexpected costs

### 7. Monitoring & Error Tracking

#### **Set Up Monitoring**

- [ ] Add error tracking (e.g., Sentry)
- [ ] Set up uptime monitoring (e.g., UptimeRobot, Better Uptime)
- [ ] Configure Vercel Analytics
- [ ] Set up alerts for cron job failures

#### **Log Monitoring**

- [ ] Monitor Vercel function logs for errors
- [ ] Check Supabase logs for database errors
- [ ] Monitor Twilio logs for SMS issues
- [ ] Track Anthropic API usage and costs

### 8. Performance Optimization

- [ ] Enable Vercel Edge Functions for API routes (if applicable)
- [ ] Configure CDN caching for static assets
- [ ] Optimize images (use Next.js Image component)
- [ ] Enable ISR (Incremental Static Regeneration) for static pages
- [ ] Add database indexes for frequently queried columns

### 9. Documentation

- [ ] Update README with production setup instructions
- [ ] Document all environment variables
- [ ] Create user guide for SMS commands (✅ Done: /accountability/sms-guide)
- [ ] Document API endpoints for future reference
- [ ] Create troubleshooting guide

### 10. Backup & Recovery

- [ ] Set up Supabase database backups (automatic daily backups)
- [ ] Test database restore process
- [ ] Document rollback procedure
- [ ] Keep a copy of all migration scripts

## 🔄 Regular Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor SMS delivery rates
- [ ] Verify cron jobs are running

### Weekly
- [ ] Review Anthropic API usage and costs
- [ ] Check Twilio SMS costs
- [ ] Review user feedback

### Monthly
- [ ] Audit user accounts for issues
- [ ] Review and optimize database queries
- [ ] Update dependencies (npm update)
- [ ] Review security vulnerabilities (npm audit)

## 📞 Support Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Twilio Support**: https://www.twilio.com/help/contact
- **Anthropic Support**: https://support.anthropic.com

## 🚨 Troubleshooting

### SMS Not Received

1. Check Twilio logs for message status
2. Verify webhook URL is correct and publicly accessible
3. Check Vercel function logs for errors
4. Verify phone number is verified (for trial accounts)

### Cron Jobs Not Running

1. Check Vercel cron configuration
2. Verify `CRON_SECRET` is set correctly
3. Check function logs for errors
4. Test cron endpoint manually with curl

### Database Errors

1. Check Supabase logs
2. Verify RLS policies are not blocking queries
3. Check connection pool limits
4. Verify migration order is correct

### AI Parsing Errors

1. Check Anthropic API key is valid
2. Verify API usage limits not exceeded
3. Check prompt is correct in `ai-parser.ts`
4. Review function logs for specific errors

---

## ✅ Production Ready

Once all items are checked off, your Family Accountability Platform is ready for production use! 🎉

**Last Updated**: January 2025
**Version**: 1.0.0
