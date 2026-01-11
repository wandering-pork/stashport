# Phase 4: Production Setup & Deployment - PLAN

**Status:** 📋 Planning
**Target Start:** After Phase 3 completion
**Expected Duration:** 1-2 days

---

## Overview

Phase 4 prepares the application for production deployment. This includes setting up a custom domain, configuring security, optimizing performance, and preparing infrastructure for production.

---

## Phase 4 Tasks

### 1. Custom Domain Setup (OAuth Branding)
- **Purpose:** Remove "randomwords.supabase.co" from OAuth authorized domain
- Purchase custom domain (if not already owned)
- In Supabase Dashboard:
  - Navigate to **Authentication** → **Custom Domains**
  - Enter your custom domain (e.g., `auth.yourdomain.com`)
  - Supabase generates DNS records
- Update domain DNS settings:
  - Go to domain registrar (GoDaddy, Namecheap, etc.)
  - Add CNAME record Supabase provides
  - Wait for DNS propagation (5 min - 24 hours)
- Update app's redirect URLs:
  - Supabase → **URL Configuration**
  - Update Site URL to custom domain
  - Update Redirect URLs to use custom domain

### 2. Environment Configuration
- Update `.env.production` with production values
- Configure production Supabase URL and keys
- Update OAuth redirect URIs in Google Console & Facebook App Settings
- Set production domain in Google OAuth consent screen
- Verify all credentials are environment-based (not hardcoded)

### 3. Security Hardening
- Enable email verification in Supabase (if not already)
- Configure email confirmation links to point to custom domain
- Review and enforce Row Level Security (RLS) policies
- Implement rate limiting on auth endpoints
- Add CORS configuration for production domain
- Update CSP headers if applicable

### 4. Build & Deployment Preparation
- Optimize Next.js build:
  - Run `npm run build` in production mode
  - Check bundle size
  - Identify and optimize large dependencies
- Set up deployment platform (Vercel, Netlify, etc.)
- Configure deployment environment variables
- Test production build locally

### 5. Error Monitoring & Logging
- Set up error tracking (Sentry, LogRocket, etc.) - optional
- Configure error reporting in production
- Set up logging for auth events
- Implement health check endpoint

### 6. Performance Optimization
- Enable caching headers
- Optimize images and assets
- Implement analytics (optional)
- Set up CDN if needed

### 7. Testing Before Launch
- Test OAuth with custom domain
- Test all auth flows (Google, Facebook, email/password)
- Verify session persistence
- Test across different browsers
- Test on mobile devices
- Verify email confirmations (if enabled)
- Test rate limiting

### 8. Documentation & Deployment
- Document production setup steps
- Create deployment checklist
- Set up CI/CD pipeline (optional)
- Create rollback plan
- Deploy to production

---

## Custom Domain Details

### Why Custom Domain?
- **Current:** OAuth authorized domain shows `aeudkpniqgwvqbgsgogg.supabase.co`
- **After:** OAuth authorized domain shows `yourdomain.com` or `auth.yourdomain.com`
- **Benefit:** More professional, better branding, looks like your app not Supabase's

### Steps Summary
1. Buy domain (GoDaddy, Namecheap, Namecheap, etc.)
2. In Supabase: **Auth** → **Custom Domains** → add your domain
3. Copy DNS records Supabase provides
4. In domain registrar: Add CNAME record
5. Wait for DNS propagation
6. Update Supabase URL Configuration with custom domain
7. Test OAuth flow

---

## Files to Create/Update

```
.env.production               # Production environment variables
.env.example                  # Template for env variables
docs/deployment.md            # Deployment guide
docs/custom-domain.md         # Custom domain setup guide
```

---

## Pre-Production Checklist

- [ ] Phase 3 (Itinerary Management) complete and tested
- [ ] All features working in development
- [ ] Build passes with zero errors
- [ ] No console errors in browser
- [ ] All dependencies updated
- [ ] Security review completed
- [ ] Custom domain purchased
- [ ] DNS records configured
- [ ] OAuth credentials updated for production domain
- [ ] Environment variables configured
- [ ] Production build tested locally
- [ ] Database backups configured
- [ ] Error tracking set up
- [ ] All auth flows tested end-to-end

---

## Success Criteria for Phase 4

✅ Custom domain configured and working
✅ OAuth authorized domain shows custom domain (not Supabase)
✅ All auth flows work with custom domain
✅ Production build passes
✅ No console errors in production
✅ Performance metrics acceptable
✅ Security hardening implemented
✅ Deployment successful
✅ All features tested in production

---

## What's After Phase 4

### Phase 5+: Advanced Features (Post-Production)
- Itinerary sharing and public links
- Social media integration
- Calendar export (iCal)
- Advanced search and discovery
- User profiles
- Reviews and ratings
- Analytics and insights
- Mobile app (if needed)

---

## Phase 4 is Ready to Plan

Phase 4 should be implemented after Phase 3 is complete and you're ready to launch. The custom domain setup is the primary difference from development to production.
