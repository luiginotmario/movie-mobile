# Supabase Setup Guide

This guide explains how to set up Supabase for the MovieLibrary app with offline-first architecture.

## Architecture Overview

The app uses a **hybrid storage approach**:
- **Local Storage (UserDefaults/CoreData)**: Primary data store for instant access and offline support
- **Supabase (PostgreSQL)**: Cloud backup and sync across devices
- **TMDB API**: Read-only movie metadata (covers, cast, trailers, etc.)

## Why This Architecture?

1. **Offline First**: App works without internet connection
2. **Fast Performance**: Local data = instant loading
3. **Sync When Online**: Automatic background sync to Supabase
4. **Cross-Device**: Access your library on multiple devices
5. **Backup**: Your data is safely stored in the cloud

---

## Supabase Database Schema

### 1. Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own data
CREATE POLICY "Users can view own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    USING (auth.uid() = id);
```

### 2. Movies Table

```sql
CREATE TABLE movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    -- TMDB Data (read-only from API)
    tmdb_id TEXT,
    title TEXT NOT NULL,
    poster_url TEXT,
    backdrop_url TEXT,
    overview TEXT,
    release_date TEXT,
    rating DECIMAL(3,1),
    rotten_tomatoes_score INTEGER,
    genres TEXT[], -- Array of genre names
    runtime INTEGER,
    director TEXT,
    cast TEXT[], -- Array of actor names
    
    -- User Data (editable)
    watch_status TEXT NOT NULL DEFAULT 'watchLater' CHECK (watch_status IN ('watchLater', 'watching', 'watched')),
    user_rating DECIMAL(2,1),
    notes TEXT,
    source_service TEXT, -- Which streaming service
    
    -- Sync Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT user_movie_unique UNIQUE (user_id, tmdb_id)
);

-- Indexes for performance
CREATE INDEX idx_movies_user_id ON movies(user_id);
CREATE INDEX idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX idx_movies_watch_status ON movies(watch_status);
CREATE INDEX idx_movies_updated_at ON movies(updated_at);

-- Enable Row Level Security
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own movies
CREATE POLICY "Users can view own movies"
    ON movies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own movies"
    ON movies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own movies"
    ON movies FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own movies"
    ON movies FOR DELETE
    USING (auth.uid() = user_id);
```

### 3. TV Series Table

```sql
CREATE TABLE tv_series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    -- TMDB Data
    tmdb_id TEXT,
    title TEXT NOT NULL,
    poster_url TEXT,
    overview TEXT,
    number_of_seasons INTEGER,
    number_of_episodes INTEGER,
    
    -- User Data
    watch_status TEXT NOT NULL DEFAULT 'watchLater' CHECK (watch_status IN ('watchLater', 'watching', 'watched')),
    current_season INTEGER,
    current_episode INTEGER,
    source_service TEXT,
    
    -- Sync Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT user_series_unique UNIQUE (user_id, tmdb_id)
);

-- Indexes
CREATE INDEX idx_tv_series_user_id ON tv_series(user_id);
CREATE INDEX idx_tv_series_tmdb_id ON tv_series(tmdb_id);
CREATE INDEX idx_tv_series_watch_status ON tv_series(watch_status);
CREATE INDEX idx_tv_series_updated_at ON tv_series(updated_at);

-- Enable RLS
ALTER TABLE tv_series ENABLE ROW LEVEL SECURITY;

-- Policies (same as movies)
CREATE POLICY "Users can view own series"
    ON tv_series FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own series"
    ON tv_series FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own series"
    ON tv_series FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own series"
    ON tv_series FOR DELETE
    USING (auth.uid() = user_id);
```

### 4. Sync Queue Table (for offline operations)

```sql
CREATE TABLE sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    entity_type TEXT NOT NULL, -- 'movie' or 'tv_series'
    entity_id UUID NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('insert', 'update', 'delete')),
    payload JSONB, -- The data to sync
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_processed ON sync_queue(processed);

-- Enable RLS
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sync queue"
    ON sync_queue
    USING (auth.uid() = user_id);
```

### 5. Database Functions

```sql
-- Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_movies_updated_at
    BEFORE UPDATE ON movies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tv_series_updated_at
    BEFORE UPDATE ON tv_series
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## Offline Sync Strategy

### How It Works

1. **All operations happen locally first** (instant feedback)
2. **Changes are queued** in local storage
3. **Background sync** when internet is available
4. **Conflict resolution** uses "last write wins" with timestamps

### Implementation Flow

```
User Action (Add/Edit/Delete Movie)
    ↓
Save to Local Storage (UserDefaults/CoreData)
    ↓
Add to Sync Queue
    ↓
Display Updated UI (instant)
    ↓
[When Online] Background Sync to Supabase
    ↓
Mark as Synced in Local Storage
    ↓
Remove from Sync Queue
```

### Handling Offline Operations

#### Adding a Movie (Offline)

1. Save movie to local UserDefaults
2. Generate temporary UUID
3. Add to sync queue with operation='insert'
4. Show movie in UI immediately

#### When Connection Restored

1. Check sync queue for pending operations
2. Process each operation in order
3. For 'insert': POST to Supabase, get real UUID
4. For 'update': PUT to Supabase
5. For 'delete': DELETE from Supabase
6. Update local storage with server response
7. Clear sync queue

### SQL Queries Work Offline?

**No, SQL queries to Supabase require internet connection.**

**Solution**: Use **local database** (CoreData or SQLite) that mirrors Supabase structure:

```swift
// Local Storage Options:

1. UserDefaults (current) - Good for <100 movies, simple
2. CoreData - Better for larger libraries, complex queries
3. SQLite.swift - Direct SQL access, lightweight
```

**Recommended**: Migrate from UserDefaults to **CoreData** for:
- Offline SQL-like queries
- Better performance with large data
- Relationship management
- Automatic sync with CloudKit (optional)

---

## Setup Instructions

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Wait for database to provision
4. Go to SQL Editor
5. Run all the SQL commands above

### 2. Configure Authentication

```sql
-- Enable email authentication
-- Settings > Authentication > Email Auth
-- Set site URL: your-app-scheme://

-- Or use magic links (passwordless)
```

### 3. Get API Credentials

1. Go to Settings > API
2. Copy:
   - Project URL
   - Anon/Public Key (safe for client-side)
3. Add to `Config.swift`

### 4. Install Supabase SDK

Add to `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/supabase/supabase-swift.git", from: "2.0.0")
]
```

Or use Swift Package Manager in Xcode:
- File > Add Package Dependencies
- Enter: https://github.com/supabase/supabase-swift

### 5. Initialize Supabase Client

Create `SupabaseService.swift`:

```swift
import Supabase

class SupabaseService {
    static let shared = SupabaseService()
    
    let client: SupabaseClient
    
    private init() {
        client = SupabaseClient(
            supabaseURL: URL(string: Config.supabaseURL)!,
            supabaseKey: Config.supabaseAnonKey
        )
    }
}
```

---

## Sync Implementation Example

```swift
class MovieSyncService {
    private let supabase = SupabaseService.shared.client
    private let localStore = MovieStore.shared
    
    func syncMovies() async throws {
        guard NetworkMonitor.shared.isConnected else { return }
        
        // 1. Push local changes to Supabase
        try await pushLocalChanges()
        
        // 2. Pull remote changes from Supabase
        try await pullRemoteChanges()
    }
    
    private func pushLocalChanges() async throws {
        let queue = localStore.getSyncQueue()
        
        for item in queue {
            switch item.operation {
            case .insert:
                try await supabase.from("movies")
                    .insert(item.payload)
                    .execute()
                
            case .update:
                try await supabase.from("movies")
                    .update(item.payload)
                    .eq("id", value: item.entityId)
                    .execute()
                
            case .delete:
                try await supabase.from("movies")
                    .delete()
                    .eq("id", value: item.entityId)
                    .execute()
            }
            
            localStore.removeSyncQueueItem(item.id)
        }
    }
    
    private func pullRemoteChanges() async throws {
        let lastSync = localStore.getLastSyncDate()
        
        let response = try await supabase.from("movies")
            .select()
            .gt("updated_at", value: lastSync)
            .execute()
        
        let movies: [Movie] = try response.decode()
        
        for movie in movies {
            localStore.updateOrInsertMovie(movie)
        }
        
        localStore.setLastSyncDate(Date())
    }
}
```

---

## Testing Offline Functionality

### In Simulator

1. Settings > Developer > Network Link Conditioner
2. Turn off WiFi
3. Test app functionality

### In Xcode

1. Debug > Simulate Location > Custom Location
2. Or use Network Link Conditioner

### Verify

- [ ] Can add movies offline
- [ ] Can edit movies offline
- [ ] Can delete movies offline
- [ ] UI updates instantly
- [ ] Changes sync when online
- [ ] No data loss

---

## Best Practices

1. **Sync in Background**: Use `BackgroundTasks` framework
2. **Conflict Resolution**: Last write wins (use timestamps)
3. **Error Handling**: Retry failed syncs with exponential backoff
4. **User Feedback**: Show sync status in UI
5. **Batch Operations**: Sync multiple changes at once
6. **Delta Sync**: Only sync changed data (use `updated_at`)

---

## Migration Path

### From UserDefaults to CoreData

1. Create CoreData model matching current structure
2. One-time migration: read UserDefaults → write to CoreData
3. Update MovieStore to use CoreData
4. Keep UserDefaults for app settings only

### Code Structure

```
MovieLibrary/
├── Persistence/
│   ├── CoreDataStack.swift
│   ├── MovieEntity+CoreData.swift
│   └── LocalStorageManager.swift
├── Services/
│   ├── APIService.swift (TMDB)
│   ├── SupabaseService.swift (Cloud sync)
│   └── SyncService.swift (Offline sync)
└── ViewModels/
    └── MovieStore.swift (Combines all sources)
```

---

## Summary

✅ **Offline-first**: All operations work without internet
✅ **Cloud backup**: Data synced to Supabase
✅ **Fast**: Local storage = instant UI updates
✅ **Reliable**: Sync queue prevents data loss
✅ **Scalable**: CoreData for large libraries

**Next Steps**:
1. Set up Supabase project
2. Run database schema
3. Add Supabase SDK to project
4. Implement SyncService
5. Migrate to CoreData (optional but recommended)
