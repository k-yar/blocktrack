# 🚀 Quick Start Guide - Using Your Deployed BlockTrack App

Congratulations! Your BlockTrack app is now deployed on Cloudflare Pages. Follow these steps to get it running:

## Step 1: Get Your App URL

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Pages**
3. Click on your `blocktrack` project
4. Your app URL will be shown (e.g., `https://blocktrack-xxxxx.pages.dev`)

## Step 2: Configure Environment Variables in Cloudflare Pages

Your app needs Supabase credentials to work. Add them in Cloudflare:

1. In your Cloudflare Pages project, go to **Settings** → **Environment variables**
2. Add these two variables (for **Production**, **Preview**, and **Development**):

   ```
   VITE_SUPABASE_URL = https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key_here
   ```
   
   **Where to find these:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to **Settings** → **API**
   - Copy the **Project URL** and **anon/public** key

3. **Save** and **redeploy** your site (go to **Deployments** → click **Retry deployment** on the latest deployment)

## Step 3: Set Up Your Supabase Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Open the file `supabase-setup.sql` from this project
5. Copy and paste the entire SQL script into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned" if everything worked

This creates:
- `areas` table (for tracking areas like "Startup", "Religion", etc.)
- `blocks` table (for logging your time blocks)
- `monthly_targets` table (for setting monthly goals)
- All necessary security policies and indexes

## Step 4: Access Your App! 🎉

1. Visit your Cloudflare Pages URL
2. You should see the BlockTrack dashboard
3. If you see an error about missing Supabase config, double-check Step 2

## Using Your App

### Dashboard (Home Page)
- **View your progress** by week, month, year, or all time
- **Log new blocks** using the "+ Log Block" button
- **See visual progress** bars showing completed vs target blocks per area

### Targets Page
- **Create areas** (e.g., "Startup", "Religion", "German")
- **Set monthly targets** for each area and block type
- **Customize colors** for each area

### Logging Blocks
- Click **"+ Log Block"** on the dashboard
- Select the area, block type (Deep/Short/Micro/Gym/Family), date, and duration
- Add optional notes
- Click **Save** to log your time

## Accessing on Mobile 📱

1. Open your Cloudflare Pages URL on your phone's browser
2. **Add to Home Screen**:
   - **iOS (Safari)**: Tap Share → Add to Home Screen
   - **Android (Chrome)**: Tap Menu (⋮) → Add to Home Screen / Install app

This makes it feel like a native app!

## Troubleshooting

### "Missing Supabase environment variables" error
- ✅ Make sure you added the environment variables in Cloudflare Pages (Step 2)
- ✅ Redeploy after adding environment variables

### "Failed to fetch" or database errors
- ✅ Make sure you ran the SQL setup script in Supabase (Step 3)
- ✅ Check that your Supabase project is active (not paused)
- ✅ Verify the Supabase URL and key are correct

### App loads but shows no data
- ✅ This is normal if you haven't created any areas or logged blocks yet
- ✅ Go to the Targets page to create your first area
- ✅ Then log your first block from the Dashboard

## Next Steps

- Set up your areas on the **Targets** page
- Create monthly targets for each area
- Start logging your blocks from the **Dashboard**
- Bookmark the URL for easy access

Enjoy tracking your time! 🎯



