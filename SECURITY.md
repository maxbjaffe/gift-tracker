# 🔒 Security Audit & Recommendations

## Overview

This document outlines security considerations and recommendations for the Family Accountability Platform.

## ✅ Current Security Measures

### Authentication & Authorization

- ✅ **Supabase Auth**: Built-in JWT-based authentication
- ✅ **Row Level Security (RLS)**: All tables have RLS policies
- ✅ **User Scoping**: Users can only access their own data
- ✅ **Service Role Isolation**: Service role key only used in server-side API routes

### Data Protection

- ✅ **Environment Variables**: Secrets stored in environment variables
- ✅ **HTTPS**: All communication encrypted in transit (Vercel enforced)
- ✅ **Database Encryption**: Supabase encrypts data at rest

### API Security

- ✅ **Cron Secret**: Cron jobs protected with secret key
- ✅ **Server-Side Validation**: All mutations validated server-side
- ✅ **Type Safety**: TypeScript for compile-time type checking

## ⚠️ Security Recommendations

### 1. SMS Webhook Security

**Current State**: SMS webhook accepts any POST request

**Recommendation**: Add Twilio signature validation

```typescript
// src/lib/twilio/validate-signature.ts
import crypto from 'crypto';

export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN!;

  // Sort parameters
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);

  // Create HMAC
  const hmac = crypto
    .createHmac('sha1', authToken)
    .update(Buffer.from(data, 'utf-8'))
    .digest('base64');

  return hmac === signature;
}
```

**Usage in webhook**:

```typescript
// src/app/api/sms/receive/route.ts
const signature = request.headers.get('x-twilio-signature');
if (!signature || !validateTwilioSignature(signature, url, params)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
}
```

### 2. Rate Limiting

**Current State**: No rate limiting on endpoints

**Recommendation**: Add rate limiting to prevent abuse

**Option 1: Vercel Edge Middleware** (Simple)

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
}
```

**Option 2: Per-Route Rate Limiting**

For sensitive endpoints like SMS webhook:
- SMS webhook: 100 requests per minute per phone number
- API mutations: 30 requests per minute per user
- AI parsing: 20 requests per minute per user (costs!)

### 3. Input Sanitization

**Current State**: Relying on Supabase for SQL injection prevention

**Recommendation**: Add explicit input validation

```typescript
// src/lib/validation/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input: string): string {
  // Remove any potential XSS
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

export function validatePhoneNumber(phone: string): boolean {
  // E.164 format: +[country code][number]
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

export function validateChildName(name: string): boolean {
  // Allow letters, spaces, hyphens, apostrophes
  return /^[a-zA-Z\s\-']{1,50}$/.test(name);
}
```

### 4. CSRF Protection

**Current State**: No CSRF tokens

**Recommendation**: Add CSRF protection for mutations

Next.js 14 with App Router has built-in CSRF protection for Server Actions, but API routes need manual protection.

```typescript
// src/lib/csrf.ts
import { cookies } from 'next/headers';
import crypto from 'crypto';

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string): boolean {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('csrf-token')?.value;
  return token === sessionToken;
}
```

### 5. Secrets Rotation

**Current State**: Secrets set once and never rotated

**Recommendation**: Implement secrets rotation policy

- [ ] Rotate `SUPABASE_SERVICE_ROLE_KEY` every 90 days
- [ ] Rotate `CRON_SECRET` every 90 days
- [ ] Rotate `ANTHROPIC_API_KEY` if compromised
- [ ] Update `TWILIO_AUTH_TOKEN` if changed in Twilio console

**Document rotation procedure**:

1. Generate new secret
2. Add to Vercel environment variables (keep old)
3. Deploy new version
4. Remove old secret after 24 hours

### 6. Error Handling

**Current State**: Generic error messages

**Recommendation**: Never leak sensitive information in errors

```typescript
// Bad
catch (error) {
  return NextResponse.json({ error: error.message }); // Might leak DB structure
}

// Good
catch (error) {
  console.error('Database error:', error); // Log for debugging
  return NextResponse.json({ error: 'An error occurred' }); // Generic user message
}
```

### 7. Logging & Monitoring

**Current State**: Console.log statements

**Recommendation**: Implement structured logging

```typescript
// src/lib/logger.ts
export const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date() }));
  },
  error: (message: string, error: Error, meta?: Record<string, any>) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error.message,
      stack: error.stack,
      ...meta,
      timestamp: new Date(),
    }));
  },
  warn: (message: string, meta?: Record<string, any>) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...meta, timestamp: new Date() }));
  },
};
```

**Never log**:
- Passwords or tokens
- Full phone numbers (log last 4 digits only)
- Credit card information
- Supabase service role key

### 8. Content Security Policy

**Current State**: No CSP headers

**Recommendation**: Add Content Security Policy headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://*.supabase.co https://api.anthropic.com;
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 9. Dependency Security

**Current State**: Dependencies not regularly audited

**Recommendation**: Regular security audits

```bash
# Run before each deployment
npm audit

# Fix vulnerabilities
npm audit fix

# For breaking changes
npm audit fix --force

# Check outdated packages
npm outdated
```

**Set up GitHub Dependabot**:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### 10. SMS-Specific Security

**Concerns**:
- SMS phishing attacks
- Unauthorized users sending SMS
- Rate limit abuse
- Cost management

**Recommendations**:

1. **Verify Phone Ownership**:
   ```typescript
   // Send verification code before enabling SMS features
   async function verifyPhoneNumber(phone: string) {
     const code = generateVerificationCode();
     await sendSMS(phone, `Your verification code is: ${code}`);
     // Store code in database with expiry
   }
   ```

2. **Daily SMS Limits**:
   ```typescript
   // Prevent SMS spam abuse
   const DAILY_SMS_LIMIT = 50; // per user

   async function checkSMSLimit(userId: string): Promise<boolean> {
     const count = await getTodaySMSCount(userId);
     return count < DAILY_SMS_LIMIT;
   }
   ```

3. **Cost Alerts**:
   - Set up billing alerts in Twilio
   - Monitor daily SMS costs
   - Alert if costs exceed $X per day

## 🔐 Secure Defaults

### Recommended Environment Variable Template

```bash
# .env.example (safe to commit)
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-key

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15555555555
TWILIO_SMS_WEBHOOK_URL=https://yourdomain.com/api/sms/receive

# Cron
CRON_SECRET=generate_with_openssl_rand

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 📊 Security Monitoring

### What to Monitor

1. **Failed Authentication Attempts**
   - Alert on >5 failed attempts per IP per hour

2. **Unusual API Usage**
   - Alert on >1000 requests per user per hour
   - Alert on unexpected cron job failures

3. **Database Anomalies**
   - Alert on >100 queries per second
   - Alert on failed RLS policy checks

4. **SMS Anomalies**
   - Alert on >10 SMS per phone number per hour
   - Alert on SMS costs >$X per day

### Recommended Tools

- **Sentry**: Error tracking and monitoring
- **Vercel Analytics**: Performance and usage tracking
- **Better Uptime**: Uptime monitoring and alerts
- **Supabase Dashboard**: Database performance monitoring

## 🚨 Incident Response

### In Case of Security Breach

1. **Immediate Actions**:
   - [ ] Revoke compromised keys
   - [ ] Change all secrets
   - [ ] Review access logs
   - [ ] Notify affected users

2. **Investigation**:
   - [ ] Identify attack vector
   - [ ] Assess data exposure
   - [ ] Document timeline
   - [ ] Preserve logs

3. **Recovery**:
   - [ ] Patch vulnerability
   - [ ] Deploy security updates
   - [ ] Monitor for recurrence
   - [ ] Update security procedures

4. **Post-Incident**:
   - [ ] Write incident report
   - [ ] Update security measures
   - [ ] Train team on lessons learned

## 📝 Security Checklist for Production

- [ ] All secrets rotated and secure
- [ ] RLS policies tested and verified
- [ ] Input validation on all user inputs
- [ ] Rate limiting implemented
- [ ] CSRF protection enabled
- [ ] Twilio signature validation active
- [ ] CSP headers configured
- [ ] Error messages sanitized
- [ ] Logging properly configured
- [ ] Security headers set
- [ ] Dependencies audited
- [ ] Monitoring and alerts configured
- [ ] Incident response plan documented
- [ ] Team trained on security best practices

---

**Last Updated**: January 2025
**Next Review**: April 2025

**Security Contact**: Add your security contact email here
