# Roost & Rise 🐔

A gamified study companion mobile app built with React Native + Expo and Supabase. Designed around an anti-grind philosophy: rest and self-care are rewarded alongside study.

## Tech Stack

- **React Native + Expo (SDK 54)** — frontend
- **Supabase** — authentication and PostgreSQL database
- **TypeScript**
- **Jest + jest-expo + @testing-library/react-native v14** - automated testing

## Get started

## Path 1: Expo Go

**Prerequisites:** Node.js, the Expo Go app on a physical device.

### 1. Download Expo Go on your phone
Install [Expo Go](https://expo.dev/go) (free).

### 2. Clone the project

```bash
git clone https://github.com/caoxiang427-ship-it/Roost-and-Rise
cd Roost-and-Rise
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up environment variables

Create a `.env` file in the project root with the Supabase credentials
(Please message the team to get credentials):

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### 5. Start the app
```bash
npx expo start
```

### 6. Open the app on your phone (follow the steps in sequence)
- Make sure phone and laptop are on the same Wi-Fi.
- Press "s" on your keyboard to switch from development build to Expo Go (Make sure it is "Using Expo Go").
- Scan the QR code from the terminal:
  - **iOS:** open the Camera app, point at the QR, tap the banner (`exp://192.168.x.x:8081`).
  - **Android:** open Expo Go and tap "Scan QR code".
- After tapping the banner, you will be directed to a web page. Tap "Expo Go" instead of "Development Build".
- It takes a few seconds for Expo Go to load the app.

### 7. Sign up using email
Please do not use "Sign in with Google" as it is only available in Development Build.

## Path 2: Local Development Build

**Prerequisites:**
- macOS with [Xcode](https://apps.apple.com/us/app/xcode/id497799835) installed (for the iOS Simulator)
- Node.js
- [CocoaPods](https://cocoapods.org/) — install with `brew install cocoapods` if you don't have it

### 1. Clone the project

```bash
git clone https://github.com/caoxiang427-ship-it/Roost-and-Rise
cd Roost-and-Rise
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root with the Supabase credentials
(Please message the team to get credentials):

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### 4. Build and run

**iOS (macOS only):**
```bash
npx expo run:ios
```
Requires Xcode and CocoaPods.

**Android**
```bash
npx expo run:android
```
Requires Android Studio with an emulator (or a connected device).

The first build compiles the native code and takes several minutes. This is normal. Later runs are much faster.

Once built, the app opens automatically in the iOS Simulator (run:ios) or the Android emulator (run:android) with all features available.

No Expo account or access to our Expo project is needed.

## Features (Milestone 3)

**Authentication**
- Email and password authentication via Supabase
- Account lockout after 5 failed attempts
- Persistent sessions across app restarts
- Route protection (logged-out users redirected to sign-in)

**To-do List**
- Create tasks
- Easy task rescheduling
- Calendar, date specific view
- Search tasks

**XP system & virtual chicken companion**
- AI chatbot
- XP & coin reward system
- Shop items & customisation
- Narrative progression

**Pomodoro Timer**
- Customisable focus and break duration
- Transition modals 
- Longer break every 4th completed focus session
- Partial session tracking for cancelled cycles
- Late-night usage warning
- Daily summary card showing sessions completed and focus minutes

**Self-care & Recovery System**
- 6 default self-care categories
- Customisable categories: add or remove categories
- "Today's self-care" section (including the total counts of activities done)
- Optional activity notes per log
- Daily mood check-in on a 5-point emoji scale

**Wellness Indicator (Inside recovery system)**
- Real-time score recomputed from multiple behavioural signals
- 4 tier classification: Engaged, Balanced, Overextended, Burnout
- Grounded in MBS-SS

**AI planner**
- Day & week view
- Drag to create event
- Task syncing with to-do list
- Drag to reschedule

## Project Structure

- `src/app/` — screens and navigation (Expo Router)
- `src/app/(auth)/` — sign-in and sign-up screens
- `src/app/(tabs)/` — main feature screens (e.g., pomodoro_timer)
- `src/lib/` — Supabase client and helper functions (e.g., auth)
- `src/components/` — reusable components (e.g., BurnoutIndicator)
- `supabase/migrations/` — database schema
- `__tests__/` — unit + integration + component tests

## Testing

3 levels test: unit tests, integration tests, and component/UI tests

Test case design on 3 types: typical, edge, and multi-input

To run the tests:

```bash
npm test
```
Current coverage: 336 tests in total, all passed
