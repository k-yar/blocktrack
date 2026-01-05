# Deployment Guide for BlockTrack

This guide will help you deploy BlockTrack so you can access it on your phone and anywhere else.

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest) ⭐

**Why Vercel?**
- Free tier with generous limits
- Automatic HTTPS
- Global CDN (fast worldwide)
- Zero configuration needed for Vite
- Mobile-friendly URLs

**Steps:**

1. **Push your code to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Sign up for Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

3. **Import your project**:
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings

4. **Add Environment Variables**:
   - In the project settings, go to "Environment Variables"
   - Add these two variables:
     - `VITE_SUPABASE_URL` = `https://byogwalhwiibzmswtvey.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5b2d3YWxod2lpYnptc3d0dmV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTA1MjcsImV4cCI6MjA4MzE4NjUyN30.R0z3faXLBbMAuErRx61-TBEuO9WirIa8qoGkwJQVCsw`
   - Make sure to select "Production", "Preview", and "Development" environments

5. **Deploy**:
   - Click "Deploy"
   - Wait ~2 minutes
   - Your app will be live at `https://your-project-name.vercel.app`

6. **Access on Phone**:
   - Open the URL on your phone's browser
   - Optionally: Add to Home Screen (iOS: Share → Add to Home Screen, Android: Menu → Add to Home Screen)

---

### Option 2: Netlify

**Steps:**

1. **Push to GitHub** (same as above)

2. **Sign up for Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

3. **Deploy**:
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Build settings (auto-detected):
     - Build command: `npm run build`
     - Publish directory: `dist`

4. **Environment Variables**:
   - Go to Site settings → Environment variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

5. **Deploy**:
   - Click "Deploy site"
   - Your app will be at `https://your-project-name.netlify.app`

---

### Option 3: Cloudflare Pages

**Steps:**

1. **Push to GitHub**

2. **Sign up for Cloudflare**:
   - Go to [pages.cloudflare.com](https://pages.cloudflare.com)
   - Sign up/login

3. **Create a project**:
   - Connect your GitHub repository
   - Build settings:
     - Framework preset: Vite
     - Build command: `npm run build`
     - Build output directory: `dist`

4. **Environment Variables**:
   - Go to Settings → Environment variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

5. **Deploy**:
   - Your app will be at `https://your-project-name.pages.dev`

---

## Custom Domain (Optional)

All platforms allow you to add a custom domain:
- Vercel: Project Settings → Domains
- Netlify: Site settings → Domain management
- Cloudflare: Custom domains → Add domain

---

## Mobile App Experience

To make it feel more like a native app:

1. **Add to Home Screen**:
   - iOS: Safari → Share → Add to Home Screen
   - Android: Chrome → Menu (⋮) → Add to Home Screen

2. **PWA Support** (Future Enhancement):
   - Can add a manifest.json and service worker for offline support
   - Makes it installable like a native app

---

## Troubleshooting

**Build fails?**
- Check that environment variables are set correctly
- Ensure `npm run build` works locally first

**App doesn't load?**
- Check browser console for errors
- Verify Supabase environment variables are correct
- Check Supabase project is active (not paused)

**Can't access on phone?**
- Make sure you're using the HTTPS URL (not HTTP)
- Check your phone's internet connection
- Try clearing browser cache

---

## Recommended: Vercel

For this project, **Vercel is recommended** because:
- ✅ Zero configuration
- ✅ Fastest setup (2 minutes)
- ✅ Best mobile performance
- ✅ Free SSL certificate
- ✅ Automatic deployments on git push

