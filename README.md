# BlockTrack

A personal time-blocking and goal-tracking web application built with React, TypeScript, and Supabase.

## Features

- **Dashboard**: Visual progress tracking with completed vs target blocks per area
- **Block Logging**: Quick form to log your deep work, religion, gym, or family time
- **Area Management**: Create and customize areas (e.g., Startup, Religion, German) with colors
- **Monthly Targets**: Set specific goals for each month and track your progress

## Setup

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn
- A Supabase account (free tier works)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Fill in your Supabase credentials in `.env.local`:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Supabase Setup

The app requires three tables in your Supabase database:

- `areas` - Stores your tracking areas (Startup, Religion, etc.)
- `blocks` - Stores your logged time blocks
- `monthly_targets` - Stores your monthly goals

These tables are automatically created when you run the first migration. The app uses Row Level Security (RLS) with policies that allow public access for simplicity. For a personal app, this is fine, but you may want to add authentication later.

## Security Notes

- The Supabase **anon key** is safe to expose in client-side code (it's designed for this)
- However, we use environment variables for best practices and easy configuration
- Never commit your `.env.local` file (it's in `.gitignore`)
- The `dist/` folder contains built files - don't commit it either

## Build

```bash
npm run build
```

The built files will be in the `dist/` folder.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Routing**: React Router
- **Icons**: Lucide React
