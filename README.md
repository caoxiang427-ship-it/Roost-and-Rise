# Roost & Rise 🐔

A gamified study companion mobile app built with React Native + Expo and Supabase. Designed around an anti-grind philosophy: rest and self-care are rewarded alongside study.

## Tech Stack

- **React Native + Expo (SDK 54)** — frontend
- **Supabase** — authentication and PostgreSQL database
- **TypeScript**
- **Jest + jest-expo** - unit testing

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

## Features (Milestone 2)

**Authentication**
- Email and password authentication via Supabase
- Account lockout after 5 failed attempts
- Persistent sessions across app restarts
- Route protection (logged-out users redirected to sign-in)

**Pomodoro Timer**
- Customisable focus and break duration
- Strict focus -> break cycle with forced breaks
- Longer break every 4th completed focus session
- Partial session tracking for cancelled cycles
- Late-night usage warning
- Daily summary card showing sessions completed and focus minutes

**Self-care & Recovery System**
- 6 default self-care categories
- Fully customisable: add, rename, change emoji, or delete categories
- Optional activity notes per log; latest note displayed per category
- Daily mood check-in on a 5-point emoji scale

**Wellness Indicator**
- Real-time score computed from multiple behavioural signals
- 4 tier classification: Engaged, Balanced, Overextended, Burnout
- Shown as a compact pill on Home and a full card on the Recovery screen

## Project Structure

- `src/app/` — screens and navigation (Expo Router)
- `src/app/(auth)/` — sign-in and sign-up screens
- `src/app/(tabs)/` — main feature screens (Pomodoro, Care, Edit Categories)
- `src/lib/` — Supabase client and helper functions (auth, sessions, self-care, burnout)
- `src/components/` — reusable components (BurnoutIndicator, EmojiPicker)
- `supabase/migrations/` — database schema
- `__tests__/` — unit tests

## Testing

Roost & Rise includes a Jest unit test suite covering the timer display formatting, wellness score calculation, Pomodoro session cycle logic, and late-night detection. The tests are written in TypeScript and run using the jest-expo preset.

To run the tests:

```bash
   npm test
```
Current coverage: 20 test cases across 4 test files, all passed.

## Known Limitations

- Google OAuth sign-in
- Password reset deep links

## Team
- Cao Xiang
- Cheng Ruiyan
