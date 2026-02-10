# Setup Guide - MovieLibrary iOS App

This guide will walk you through setting up the MovieLibrary app from scratch.

## Prerequisites

- macOS 14.0 (Sonoma) or later
- Xcode 15.0 or later
- iOS 17.0+ device or simulator
- Apple Developer Account (for device testing)

## Step 1: Xcode Project Setup

### Create New Xcode Project

1. Open Xcode
2. Select "Create a new Xcode project"
3. Choose "iOS" → "App"
4. Configure project:
   - **Product Name**: MovieLibrary
   - **Team**: Select your team
   - **Organization Identifier**: com.yourname
   - **Interface**: SwiftUI
   - **Language**: Swift
   - **Storage**: None (we'll use UserDefaults)
   - Uncheck "Include Tests" (optional)

5. Choose the location: `/Users/luigirivolta/license-mobile-1`

### Add Files to Project

1. In Xcode, right-click on the MovieLibrary folder
2. Select "Add Files to MovieLibrary..."
3. Add all the Swift files from the repository:
   - Models/Movie.swift
   - Views/*.swift
   - ViewModels/MovieStore.swift
   - Managers/NotificationManager.swift
   - Services/*.swift

4. Replace the default `Info.plist` with the one from this repository

### Configure Project Settings

1. Select the project in the navigator
2. Select the MovieLibrary target
3. Go to "Signing & Capabilities"
   - Enable "Automatically manage signing"
   - Select your Team
   - Ensure Bundle Identifier is unique

4. Add Capabilities:
   - Click "+ Capability"
   - Add "Background Modes"
     - Check "Background fetch"
     - Check "Remote notifications"
   - Add "Push Notifications"

5. Go to "Info" tab
   - Verify all privacy descriptions are present:
     - Privacy - Microphone Usage Description
     - Privacy - Speech Recognition Usage Description

## Step 2: API Keys Configuration

### Create Config File

1. In Xcode, create a new Swift file: `Config.swift`
2. Add it to `.gitignore` (already configured)
3. Add the following content:

```swift
import Foundation

struct Config {
    // TMDB API
    static let tmdbAPIKey = "YOUR_TMDB_API_KEY_HERE"
    static let tmdbBaseURL = "https://api.themoviedb.org/3"
    
    // 11Labs API
    static let elevenLabsAPIKey = "YOUR_ELEVENLABS_API_KEY_HERE"
    static let elevenLabsBaseURL = "https://api.elevenlabs.io/v1"
    
    // Add other API keys as needed
}
```

### Get API Keys

#### TMDB (The Movie Database)
1. Go to [themoviedb.org](https://www.themoviedb.org)
2. Create an account
3. Go to Settings → API
4. Request an API key (choose "Developer")
5. Fill out the form (use "Personal" or "Educational")
6. Copy the API Key (v3 auth)
7. Paste it in `Config.swift`

#### 11Labs (Voice AI)
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign up for an account
3. Go to your Profile → API Keys
4. Generate a new API key
5. Copy and paste it in `Config.swift`

#### Rotten Tomatoes
- No official public API available
- We'll use Exa search or web scraping as fallback
- See `APIService.swift` for implementation

### Update APIService.swift

Replace the placeholder API keys in `APIService.swift`:

```swift
private let tmdbAPIKey = Config.tmdbAPIKey
private let elevenLabsAPIKey = Config.elevenLabsAPIKey
```

## Step 3: Build and Run

### First Build

1. Select your target device or simulator (iOS 17.0+)
2. Press Cmd+B to build
3. Fix any build errors if they appear
4. Press Cmd+R to run

### Test Basic Functionality

1. **App Launch**: Verify the app opens with the library view
2. **Add Movie**: Tap + → "Add Movie Manually" → Fill in details
3. **View Movie**: Tap on the added movie to see details
4. **Change Status**: Update the watch status in detail view
5. **Filter**: Test the filter pills at the top

### Test Permissions

1. **Voice Search**: 
   - Tap + → "Voice Search"
   - Grant microphone permission when prompted
   - Grant speech recognition permission when prompted
   - Test voice input

2. **Notifications**:
   - Grant notification permission when prompted
   - Test reminder notifications (if implemented)

## Step 4: Streaming Service Integration (Advanced)

### Netflix Integration

⚠️ **Note**: Netflix doesn't have a public API. You'll need to use unofficial methods:

1. **Option 1**: Use browser automation (Playwright/Selenium)
2. **Option 2**: Parse Netflix viewing activity page
3. **Option 3**: Use third-party services (may violate ToS)

### Prime Video Integration

Similar to Netflix, Amazon doesn't provide a public API for Prime Video.

### Implementation Steps

1. Research each streaming service's API availability
2. Implement OAuth flows for services that support it
3. Use web scraping as fallback (check ToS first)
4. Update `StreamingServiceManager.swift` with actual implementations

## Step 5: Social Media URL Analysis

### Instagram API

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create a new app
3. Add Instagram Basic Display or Instagram Graph API
4. Get access token
5. Implement video extraction in `APIService.swift`

### TikTok API

1. Go to [developers.tiktok.com](https://developers.tiktok.com)
2. Apply for API access
3. Create an app
4. Get API credentials
5. Implement video analysis in `APIService.swift`

### Video Analysis

For identifying movies from videos:
1. Extract video frames
2. Use image recognition (Vision API, Google Cloud Vision)
3. Match against movie database
4. Return best match

## Step 6: Testing on Device

### Install on iPhone/iPad

1. Connect your device via USB
2. Select your device in Xcode
3. Press Cmd+R to build and install
4. Trust the developer certificate on device:
   - Settings → General → VPN & Device Management
   - Trust your developer certificate

### Test Device-Specific Features

- Voice search with actual microphone
- Notifications
- Background app refresh
- Performance with large library

## Step 7: Deployment (Optional)

### TestFlight Distribution

1. Archive the app: Product → Archive
2. Upload to App Store Connect
3. Configure TestFlight
4. Invite beta testers

### App Store Release

1. Prepare app metadata
2. Take screenshots (required sizes)
3. Write app description
4. Submit for review
5. Wait for approval

## Troubleshooting

### Build Errors

**"Cannot find 'Config' in scope"**
- Make sure `Config.swift` is added to the target
- Check that it's included in Compile Sources

**"Missing required module"**
- Clean build folder: Shift+Cmd+K
- Rebuild: Cmd+B

### Runtime Errors

**"API key invalid"**
- Verify your API keys in `Config.swift`
- Check that keys are properly formatted (no spaces)

**"Permission denied"**
- Check Info.plist has all required usage descriptions
- Reset permissions: Settings → Privacy → Reset

### Performance Issues

**Slow scrolling**
- Reduce image quality
- Implement image caching
- Use LazyVGrid (already implemented)

**High memory usage**
- Limit cached images
- Release unused resources
- Profile with Instruments

## Next Steps

1. ✅ Complete basic app setup
2. ✅ Test core functionality
3. ⏳ Implement streaming service APIs
4. ⏳ Add social media URL analysis
5. ⏳ Integrate 11Labs voice AI
6. ⏳ Add iCloud sync
7. ⏳ Create widgets
8. ⏳ Build Apple Watch app

## Resources

- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [11Labs API Documentation](https://docs.elevenlabs.io)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [iOS Speech Framework](https://developer.apple.com/documentation/speech)
- [UserNotifications Framework](https://developer.apple.com/documentation/usernotifications)

## Support

If you encounter issues:
1. Check this guide thoroughly
2. Review the code comments
3. Search for similar issues online
4. Check API documentation

---

Happy coding! 🎬
