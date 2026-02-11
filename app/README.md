# MovieFriend - React Native/Expo App

iOS movie library app built with React Native and Expo.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file (copy from `.env.example`) and add your API keys:
   ```
   EXPO_PUBLIC_TMDB_API_KEY=your_key
   EXPO_PUBLIC_SUPABASE_URL=your_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

3. **Add assets:**
   - Place your logo image in `assets/Logo.png`
   - Place your background image in `assets/Container.png`
   - Generate app icons using Expo's icon tools

## Development

```bash
# Start the Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Deployment to App Store

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure the build:**
   ```bash
   eas build:configure
   ```

4. **Build for iOS:**
   ```bash
   eas build --platform ios
   ```

5. **Submit to App Store:**
   ```bash
   eas submit --platform ios
   ```

## Features

- ✅ Google Sign-In authentication
- ✅ Guest mode (no login required)
- ✅ TMDB API integration for movie search
- ✅ Dark mode by default
- ✅ Native iOS components (share sheet, modals, etc.)

## Architecture

- **Frontend**: React Native + Expo
- **State Management**: React Context API
- **API**: TMDB for movie data
- **Database**: Supabase (PostgreSQL)
- **Auth**: Google Sign-In via Expo Auth Session

## No Xcode Required

All builds are handled by Expo's cloud build service (EAS). You only need:
- An Apple Developer account ($99/year)
- EAS CLI installed
- Your app configured in `app.json`
