# MovieLibrary - Your Personal Movie Collection

A beautiful iOS app built with SwiftUI to manage your movie and TV series library with advanced features like voice search, social media URL analysis, and streaming service integration.

## Features

### 🎬 Core Features
- **Apple TV-Style Library**: Beautiful grid layout with rounded corner posters
- **Liquid Glass Navigation**: Stunning translucent navigation bar with blur effects
- **Movie Detail Sheets**: Native iOS overlay sheets with comprehensive movie information
- **Watch Status Tracking**: Organize movies by "Watch Later", "Watching", and "Watched"
- **Dual Media Support**: Separate sections for movies and TV series

### 🎤 Voice Search
- Natural language movie search using voice input
- Powered by iOS Speech Recognition
- Find movies by description: "A movie about dreams within dreams"
- Integration ready for 11Labs voice AI

### 🔗 Social Media Analysis
- Analyze Instagram and TikTok URLs
- Automatically identify movies from social media posts
- Reverse video analysis to find exact movie names
- Add movies directly from discovered content

### 📺 Streaming Service Integration
- Connect multiple streaming platforms:
  - Netflix
  - Prime Video
  - Disney+
  - HBO Max
  - Apple TV+
  - Hulu
- Automatic watch history sync (when APIs available)
- Track which service each movie is from

### 🍅 Rotten Tomatoes Integration
- Fetch Rotten Tomatoes scores
- Display fresh/rotten ratings
- Automatic score lookup via API or Exa search

### 📱 Additional Features
- Search and filter your library
- Add movies manually
- Personal notes for each movie
- Genre tagging
- Cast and crew information
- Release dates and runtime
- User ratings
- Background notifications support

## Requirements

- iOS 17.0+
- Xcode 15.0+
- Swift 5.9+

## Setup

1. **Clone the repository**
   ```bash
   cd /Users/luigirivolta/license-mobile-1
   ```

2. **Configure API Keys**
   
   Create a `Config.swift` file in the MovieLibrary folder:
   ```swift
   struct Config {
       static let tmdbAPIKey = "YOUR_TMDB_API_KEY"
       static let elevenLabsAPIKey = "YOUR_ELEVENLABS_API_KEY"
       // Add other API keys as needed
   }
   ```

3. **Get API Keys**
   - **TMDB API**: Sign up at [themoviedb.org](https://www.themoviedb.org/settings/api)
   - **11Labs**: Get your API key from [elevenlabs.io](https://elevenlabs.io)
   - **Rotten Tomatoes**: Use Exa search or official API if available

4. **Open in Xcode**
   ```bash
   open MovieLibrary.xcodeproj
   ```

5. **Build and Run**
   - Select your target device or simulator
   - Press Cmd+R to build and run

## Project Structure

```
MovieLibrary/
├── Info.plist                      # App configuration with permissions
├── MovieLibraryApp.swift           # App entry point
├── Models/
│   └── Movie.swift                 # Data models for movies and TV series
├── Views/
│   ├── ContentView.swift           # Main navigation and tabs
│   ├── MovieLibraryView.swift      # Apple TV-style grid layout
│   ├── MovieDetailView.swift       # Detail overlay sheet
│   ├── AddMovieView.swift          # Manual movie entry
│   ├── URLAnalyzerView.swift       # Social media URL analysis
│   └── VoiceSearchView.swift       # Voice search interface
├── ViewModels/
│   └── MovieStore.swift            # State management and persistence
├── Managers/
│   └── NotificationManager.swift   # Push notification handling
└── Services/
    ├── APIService.swift            # API integrations (TMDB, 11Labs, etc.)
    └── StreamingServiceManager.swift # Streaming service connections
```

## Permissions

The app requires the following permissions (configured in Info.plist):

- **Microphone Access**: For voice search functionality
- **Speech Recognition**: To transcribe voice input
- **Background Modes**: For notifications and background sync
- **Network Access**: To fetch movie data and sync with streaming services

## API Integrations

### Implemented
- ✅ TMDB API structure for movie data
- ✅ Voice recognition using iOS Speech framework
- ✅ Local data persistence with UserDefaults

### To Be Implemented
- ⏳ Instagram API for video analysis
- ⏳ TikTok API for video analysis
- ⏳ 11Labs voice AI integration
- ⏳ Rotten Tomatoes score fetching
- ⏳ Netflix API (unofficial methods may be needed)
- ⏳ Prime Video API
- ⏳ Disney+ API
- ⏳ HBO Max API
- ⏳ Apple TV+ API
- ⏳ Hulu API

## Usage

### Adding Movies

1. **Manual Entry**: Tap the + button → "Add Movie Manually"
2. **Voice Search**: Tap the + button → "Voice Search" → Describe the movie
3. **URL Analysis**: Tap the + button → "Analyze URL" → Paste Instagram/TikTok link
4. **Auto Sync**: Tap the + button → "Sync Streaming Services"

### Managing Your Library

- **Filter by Status**: Use the filter pills to show "Watch Later", "Watching", or "Watched"
- **Switch Media Type**: Toggle between Movies and TV Series
- **Search**: Tap the search icon to find specific titles
- **View Details**: Tap any movie poster to see full details
- **Update Status**: In the detail view, change watch status with one tap
- **Add Notes**: Add personal notes in the detail view
- **Delete**: Remove movies from your library in the detail view

### Voice Search Tips

Say things like:
- "A movie about dreams within dreams"
- "That film with the spinning top"
- "Leonardo DiCaprio heist movie"
- "Sci-fi movie with time travel"

## Design Features

### Liquid Glass Effect
The navigation bar uses iOS's native blur effect (`UIBlurEffect.systemMaterial`) with transparency to create a stunning liquid glass appearance that adapts to light and dark modes.

### Apple TV-Style Layout
- 3-column grid layout
- Rounded corner posters (12pt radius)
- Smooth shadows and hover effects
- Status badges on each poster
- Optimized for scrolling performance

### Color Scheme
- Dark mode optimized
- Gradient backgrounds
- Status-based color coding:
  - 🔵 Blue: Watch Later
  - 🟠 Orange: Watching
  - 🟢 Green: Watched

## Future Enhancements

- [ ] iCloud sync across devices
- [ ] Widget support for quick access
- [ ] Apple Watch companion app
- [ ] Share lists with friends
- [ ] Movie recommendations based on library
- [ ] Statistics and insights
- [ ] Export/import library data
- [ ] Custom collections and playlists
- [ ] Integration with calendar for movie nights
- [ ] Social features (reviews, ratings sharing)

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

All rights reserved. This is a private project.

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.

---

Built with ❤️ using SwiftUI
