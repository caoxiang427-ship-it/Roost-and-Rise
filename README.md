# Roost & Rise 🐔

A gamified study companion mobile app built with React Native + Expo and Supabase.

## Tech Stack
- React Native + Expo (SDK 54) — frontend
- Supabase — authentication and PostgreSQL database
- TypeScript

## Get started

1. Install dependencies

```bash
   npm install
```

2. Set up environment variables

   Create a `.env` file in the project root with the Supabase credentials
   (message the team):

```
   EXPO_PUBLIC_SUPABASE_URL=...
   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Start the app

```bash
   npx expo start
```

4. Open the app on your phone

   Install [Expo Go](https://expo.dev/go) (free) and scan the QR code 
   from the terminal:
   - **iOS:** open the Camera app, point at the QR, tap the banner
   - **Android:** open Expo Go and tap "Scan QR code"

## Features (Milestone 1)
- Email and password authentication via Supabase
- Persistent sessions across app restarts
- Route protection (logged-out users redirected to sign-in)
- Row Level Security on the database

## Project Structure
- `src/app/` — screens and navigation (Expo Router)
- `src/app/(auth)/` — sign-in and sign-up screens
- `src/lib/` — Supabase client and auth helpers
- `supabase/migrations/` — database schema

## Team
- Cao Xiang
- Cheng Ruiyan
