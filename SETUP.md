# 🚀 Setup Guide — Human Traffic Filter

## Step 1 — Supabase (Free Database)

1. Go to [supabase.com](https://supabase.com) → Sign up with GitHub (FREE, no credit card)
2. Click **New Project** → Name it anything → Region: Southeast Asia → Set password
3. Wait ~2 minutes for setup
4. Go to **Settings → API** → Copy these 3 values:
   - `Project URL`
   - `anon / public` key
   - `service_role` key (keep this secret!)

## Step 2 — Create Database Tables

1. In Supabase → click **SQL Editor** → **New Query**
2. Open the file `scripts/complete-setup.sql` from this project
3. Copy ALL content → paste in SQL Editor → click **Run**
4. You should see "Success. No rows returned"

## Step 3 — Deploy to Vercel (Free)

1. Push this project to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your GitHub repo
3. In **Environment Variables**, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL    = (from Supabase Settings → API)
   NEXT_PUBLIC_SUPABASE_ANON_KEY = (anon/public key)
   SUPABASE_SERVICE_ROLE_KEY   = (service_role key)
   JWT_SECRET                  = (any random 32+ char string)
   ```
4. Click **Deploy** → Done! ✅
5. After deploy finishes, copy your live URL (e.g. `https://your-app.vercel.app`)
6. Go to **Project Settings → Environment Variables** → add one more:
   ```
   APP_URL = https://your-app.vercel.app
   ```
7. Go to **Deployments → ⋯ → Redeploy** so the new variable takes effect.
   Without `APP_URL`, generated tracking codes will point to `localhost` and won't work on real websites!

## Step 4 — First Login

- URL: `https://your-app.vercel.app/login`
- Email: `admin@example.com`
- Password: `Admin@123`

> ⚠️ Change your password after first login!

## Step 5 — Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local (copy from .env.example and fill values)
cp .env.example .env.local

# 3. Start development server
npm run dev

# 4. Open http://localhost:3000
```

## How It Works

1. Someone visits your website
2. Middleware checks: Is this a bot? (user-agent patterns)
3. Country check: Is this country allowed?
4. **Bot/bad traffic** → stays on landing page (safe decoy)
5. **Real human from allowed country** → passes through
6. Everything gets logged to your Supabase database
7. View analytics at `/admin/dashboard`

## Files Changed (vs original v0.dev version)

| File | What was fixed |
|------|---------------|
| `lib/supabase.ts` | Proper null safety, both clients exported correctly |
| `app/api/auth/login/route.ts` | Works with and without DB, proper bcrypt |
| `app/api/auth/signup/route.ts` | Full validation, duplicate check |
| `app/api/auth/logout/route.ts` | NEW — was missing |
| `app/api/auth/me/route.ts` | NEW — was missing |
| `app/api/websites/route.ts` | Auth guard, clean CRUD, no crashes |
| `app/api/track-visit/route.ts` | Full bot detection, in-memory fallback |
| `app/api/analytics/route.ts` | Auth guard, proper aggregation, no crashes |
| `app/api/dashboard-data/route.ts` | Real stats, empty state for no-DB |
| `app/api/log-current-access/route.ts` | Graceful no-DB handling |
| `middleware.ts` | Fast, reliable, never blocks on DB |
| `scripts/complete-setup.sql` | NEW — single clean SQL file to run |
