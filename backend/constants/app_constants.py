"""Application constants"""

# App URLs
APP_STORE_URL = "https://apps.apple.com/app/movielibrary"
APP_SCHEME = "movielibrary://"

# Deep Link Routes
DEEP_LINK_AUTH = f"{APP_SCHEME}auth"
DEEP_LINK_LINK_ACCOUNT = f"{APP_SCHEME}link"

# Token Expiration
LINK_TOKEN_EXPIRY_HOURS = 24

# Storage
VIDEO_STORAGE_BUCKET = "movie-clips"
MAX_CLIP_SIZE_MB = 50
ALLOWED_VIDEO_FORMATS = [".mp4", ".mov", ".avi"]

# Response Templates
MESSAGE_TEMPLATES = {
    "new_user": """🎬 Found it!

{movie_title} ({movie_year})
⭐ {movie_rating}/10

{movie_overview}

📱 Want to build your movie library?
Download MovieLibrary: {app_store_url}

Save movies, track what you watch, discover new favorites!""",
    
    "returning_user": """🎬 Found it!

{movie_title} ({movie_year})
⭐ {movie_rating}/10

{movie_overview}

🔗 Link your account to auto-save clips!
Tap here: {deep_link}

(Opens your MovieLibrary app)""",
    
    "linked_user": """🎬 Found it!

{movie_title} ({movie_year})
⭐ {movie_rating}/10

{movie_overview}

✅ Saved to your library!
Check it out in the MovieLibrary app.""",
    
    "error": "😕 Couldn't identify this movie. Try a clearer scene or different clip!",
    
    "link_success": "🎉 Account linked! Your clips will now auto-save to your library.",
    
    "link_expired": "⏰ This link has expired. Send another video to get a new link!",
}
