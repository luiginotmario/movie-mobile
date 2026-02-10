# MovieLibrary - Your Personal Movie Collection

A beautiful iOS app with intelligent backend for managing your movie and TV series library. Includes movie identification from Instagram/TikTok video clips using AI vision models.

## 🎯 Components

1. **iOS App (Frontend)**: SwiftUI app with offline-first architecture, TMDB integration, and Supabase sync
2. **Python Backend**: FastAPI server that identifies movies from video clips using VLM (OpenRouter) for Instagram/TikTok webhooks

## Features

### 🎬 Core Features
- **Apple TV-Style Library**: Beautiful grid layout with rounded corner posters
- **Liquid Glass Navigation**: Stunning translucent navigation bar with blur effects
- **Movie Detail Sheets**: Native iOS overlay sheets with comprehensive movie information
- **Watch Status Tracking**: Organize movies by "Watch Later", "Watching", and "Watched"
- **Dual Media Support**: Separate sections for movies and TV series
- **Offline-First Architecture**: Works without internet connection, syncs when online

### 🔍 TMDB Integration
- Search movies and TV series from The Movie Database
- Fetch high-quality posters and backdrop images
- Get comprehensive movie information (cast, crew, runtime, genres)
- Access video trailers
- Real-time ratings and release dates

### ☁️ Cloud Sync with Supabase
- PostgreSQL database for cloud storage
- Automatic background synchronization
- Cross-device library access
- Secure user authentication
- Row-level security for data privacy

### 📱 Additional Features
- **Search and Filter**: Find movies in your library instantly
- **Manual Entry**: Add movies not in TMDB
- **Personal Notes**: Add your thoughts and reviews
- **Genre Tags**: Organize by genre
- **Watch Progress**: Track current season/episode for TV series
- **Streaming Service Tags**: Remember where to watch
- **Push Notifications**: Set movie reminders
- **Dark Mode Optimized**: Beautiful UI in any lighting

## Requirements

- iOS 17.0+
- Xcode 15.0+
- Swift 5.9+

## Quick Start

This project has two components:
- **Frontend**: iOS app (SwiftUI) - see `frontend/`
- **Backend**: FastAPI server for Instagram/TikTok integration - see `backend/`

### Frontend (iOS App)

```bash
cd frontend
open MovieLibrary.xcodeproj
# Configure API keys in Config.swift
# Build and run (Cmd+R)
```

See [frontend/SETUP_GUIDE.md](frontend/SETUP_GUIDE.md) for detailed setup.

### Backend (Python FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp env.example .env
# Edit .env with your API keys
python main.py
```

See [backend/README.md](backend/README.md) for detailed setup.

---

## Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd movie-mobile
```

### 2. Configure API Keys

Copy the example config file:
```bash
cp MovieLibrary/Config.example.swift MovieLibrary/Config.swift
```

Edit `Config.swift` and add your API keys:
```swift
struct Config {
    static let tmdbAPIKey = "your_tmdb_api_key_here"
    static let supabaseURL = "https://your-project.supabase.co"
    static let supabaseAnonKey = "your_supabase_anon_key_here"
}
```

### 3. Get API Keys

**TMDB API** (Required):
1. Sign up at [themoviedb.org](https://www.themoviedb.org/signup)
2. Go to Settings > API
3. Request an API key (choose "Developer")
4. Copy the API Key (v3 auth)

**Supabase** (Required for cloud sync):
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > API
4. Copy Project URL and anon/public key
5. Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for database schema

### 4. Install Dependencies

Add Supabase SDK via Swift Package Manager:
1. Open Xcode
2. File > Add Package Dependencies
3. Enter: `https://github.com/supabase/supabase-swift`
4. Select version 2.0.0 or later

### 5. Build and Run

```bash
open MovieLibrary.xcodeproj
```

- Select your target device or simulator (iOS 17.0+)
- Press Cmd+R to build and run

## Project Structure

```
movie-mobile/
├── README.md                       # This file
├── SUPABASE_SETUP.md              # Database schema and sync strategy
│
├── frontend/                      # iOS App (SwiftUI)
│   ├── MovieLibrary/
│   │   ├── Info.plist
│   │   ├── MovieLibraryApp.swift
│   │   ├── Config.swift           # API keys (not in git)
│   │   ├── Config.example.swift
│   │   ├── Models/
│   │   │   └── Movie.swift
│   │   ├── Views/
│   │   │   ├── ContentView.swift
│   │   │   ├── MovieLibraryView.swift
│   │   │   ├── MovieDetailView.swift
│   │   │   ├── AddMovieView.swift
│   │   │   └── TMDBSearchView.swift
│   │   ├── ViewModels/
│   │   │   └── MovieStore.swift
│   │   ├── Managers/
│   │   │   └── NotificationManager.swift
│   │   └── Services/
│   │       └── APIService.swift
│   ├── MovieLibrary.xcodeproj
│   ├── Package.swift
│   └── SETUP_GUIDE.md
│
└── backend/                       # Python FastAPI Backend
    ├── main.py                    # FastAPI app entry point
    ├── config.py                  # Configuration
    ├── requirements.txt           # Python dependencies
    ├── env.example                # Environment template
    ├── README.md                  # Backend documentation
    └── services/
        ├── video_processor.py     # Video frame extraction
        ├── openrouter_service.py  # VLM integration
        ├── tmdb_service.py        # TMDB API
        ├── instagram_service.py   # Instagram webhooks
        └── tiktok_service.py      # TikTok webhooks
```

## Permissions

The app requires the following permissions (configured in Info.plist):

- **Network Access**: To fetch movie data from TMDB and sync with Supabase
- **Background Modes**: For automatic cloud synchronization
- **Push Notifications**: For movie reminders (optional)

## API Integrations

### Implemented
- ✅ **TMDB API**: Movie/TV search, details, cast, crew, trailers
- ✅ **Local Storage**: UserDefaults for offline-first architecture
- ✅ **Environment Variables**: Secure API key management

### In Progress
- 🔄 **Supabase Integration**: Cloud sync and authentication
- 🔄 **CoreData Migration**: Better performance for large libraries
- 🔄 **Background Sync**: Automatic cloud synchronization

### Architecture
- **Offline-First**: All data stored locally for instant access
- **Cloud Backup**: Automatic sync to Supabase when online
- **Conflict Resolution**: Last-write-wins with timestamps
- **Sync Queue**: Handles operations when offline

## Usage

### Adding Movies

1. **Search TMDB**: Tap + → "Search TMDB" → Enter movie title → Select result
2. **Manual Entry**: Tap + → "Add Manually" → Fill in movie details

### Managing Your Library

- **Filter by Status**: Use filter pills to show "Watch Later", "Watching", or "Watched"
- **Switch Media Type**: Toggle between Movies and TV Series tabs
- **Search Locally**: Use the search icon to find titles in your library
- **View Details**: Tap any poster to see full movie information
- **Update Status**: In detail view, tap status buttons to change watch state
- **Add Notes**: Write personal reviews and thoughts
- **Edit/Delete**: Update or remove movies from your library

### Working Offline

- ✅ View your entire library
- ✅ Add new movies manually
- ✅ Edit movie details and notes
- ✅ Change watch status
- ✅ Delete movies
- 📡 Changes sync automatically when back online

### Search Tips

When searching TMDB:
- Use movie titles: "Inception", "The Dark Knight"
- Include year for accuracy: "Alien 1979"
- Try partial names: "Lord of the Rings"
- Works for TV series too!

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

### Phase 1: Core Improvements
- [ ] Complete Supabase integration
- [ ] Migrate from UserDefaults to CoreData
- [ ] Implement background sync service
- [ ] Add authentication flow
- [ ] Offline queue management

### Phase 2: Enhanced Features
- [ ] Widget support for quick library access
- [ ] Apple Watch companion app
- [ ] Movie trailers in-app player
- [ ] Advanced search filters (genre, year, rating)
- [ ] Statistics and insights dashboard
- [ ] Custom collections and lists

### Phase 3: Social Features
- [ ] Share libraries with friends
- [ ] Social movie recommendations
- [ ] Group watch parties planning
- [ ] Review sharing
- [ ] Movie night calendar integration

### Phase 4: Premium Features
- [ ] AI-powered recommendations
- [ ] Watchlist suggestions based on mood
- [ ] Integration with smart home (Siri shortcuts)
- [ ] Export/import library (JSON, CSV)
- [ ] Multi-profile support for families

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

All rights reserved. This is a private project.

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.

---

Built with ❤️ using SwiftUI
