"""
FastAPI Backend for MovieLibrary
Handles Instagram/TikTok webhooks and movie identification via VLM
"""

from fastapi import FastAPI, Request, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import httpx
from typing import Optional
import json
import hashlib

from services.video_processor import VideoProcessor
from services.openrouter_service import OpenRouterService
from services.tmdb_service import TMDBService
from services.instagram_service import InstagramService
from services.tiktok_service import TikTokService
from services.user_state_service import UserStateService
from services.clip_storage_service import ClipStorageService
from services.smart_search_service import SmartSearchService
from services.geolocation_service import GeolocationService
from constants.user_states import UserState, Platform
from config import settings

# Initialize services
video_processor = VideoProcessor()
openrouter = OpenRouterService()
tmdb = TMDBService()
instagram = InstagramService()
tiktok = TikTokService()
user_state_service = UserStateService()  # TODO: Pass database client when available
clip_storage_service = ClipStorageService()  # TODO: Pass storage client when available
smart_search_service = SmartSearchService(openrouter, tmdb)
geolocation = GeolocationService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    print("🚀 Starting MovieLibrary Backend...")
    yield
    print("👋 Shutting down...")

app = FastAPI(
    title="MovieLibrary Backend",
    description="Movie identification from social media clips",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "MovieLibrary Backend",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "openrouter": await openrouter.health_check(),
            "tmdb": await tmdb.health_check(),
            "cache": tmdb.cache.health_check(),
        },
        "cache_stats": tmdb.cache.get_stats()
    }

@app.get("/cache/stats")
async def cache_stats():
    """Get cache statistics"""
    return tmdb.cache.get_stats()

@app.post("/cache/clear")
async def clear_cache():
    """Clear all cache (admin endpoint)"""
    tmdb.cache.clear_all()
    return {"status": "cache cleared"}

# Instagram Webhook
@app.get("/webhook/instagram")
async def instagram_webhook_verification(request: Request):
    """Verify Instagram webhook"""
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    
    if mode == "subscribe" and token == settings.INSTAGRAM_VERIFY_TOKEN:
        return int(challenge)
    
    raise HTTPException(status_code=403, detail="Verification failed")

@app.post("/webhook/instagram")
async def instagram_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle Instagram webhook events"""
    raw_body = await request.body()
    signature = request.headers.get("X-Hub-Signature-256") or request.headers.get("X-Hub-Signature")

    if not instagram.verify_signature(raw_body, signature):
        raise HTTPException(status_code=403, detail="Invalid signature")

    try:
        data = json.loads(raw_body.decode())
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    # Respond immediately to avoid timeout
    background_tasks.add_task(process_instagram_message, data)
    
    return {"status": "received"}

# TikTok Webhook
@app.get("/webhook/tiktok")
async def tiktok_webhook_verification(request: Request):
    """
    Verify TikTok webhook (challenge flow).
    Supports common url_verification payloads.
    """
    challenge = request.query_params.get("challenge")
    if challenge:
        return {"challenge": challenge}
    return {"status": "ok"}

@app.post("/webhook/tiktok")
async def tiktok_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle TikTok webhook events"""
    raw_body = await request.body()
    signature = request.headers.get(tiktok.signature_header)

    if not tiktok.verify_signature(raw_body, signature):
        raise HTTPException(status_code=403, detail="Invalid signature")

    try:
        data = json.loads(raw_body.decode())
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    # TikTok URL verification flow (common pattern)
    if data.get("type") == "url_verification" and data.get("challenge"):
        return {"challenge": data.get("challenge")}
    
    # Respond immediately to avoid timeout
    background_tasks.add_task(process_tiktok_message, data)
    
    return {"status": "received"}

# Direct API endpoint for testing
@app.post("/api/identify-movie")
async def identify_movie_api(video_url: str):
    """
    Direct API endpoint to identify movie from video URL
    For testing without webhooks
    """
    try:
        result = await identify_movie_from_video(video_url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Account Linking API
@app.post("/api/link-account")
async def link_social_account(user_id: str, link_token: str):
    """
    Link Instagram/TikTok account to app user account
    Called by iOS app when user taps deep link
    
    Args:
        user_id: App user ID (from Supabase auth)
        link_token: One-time linking token from deep link
        
    Returns:
        Success status and platform info
    """
    try:
        result = await user_state_service.link_account(
            app_user_id=user_id,
            link_token=link_token
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error", "Linking failed"))
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/clips")
async def get_user_clips(user_id: str, movie_id: Optional[str] = None):
    """
    Get all video clips for a user
    
    Args:
        user_id: App user ID
        movie_id: Optional movie ID to filter by
        
    Returns:
        List of user's video clips
    """
    try:
        clips = await clip_storage_service.get_user_clips(user_id, movie_id)
        return {"clips": clips}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Smart Search API
@app.get("/api/search/smart")
async def smart_search(
    query: str,
    request: Request,
    country: Optional[str] = None
):
    """
    Intelligent movie search with natural language support
    
    Examples:
        ?query=Inception                           → Direct TMDB search
        ?query=movies about dreams                 → LLM-enhanced search
        ?query=funny 90s movies with Jim Carrey    → Advanced filtered search
        ?query=sci-fi movies like Interstellar     → Similarity search
    
    Args:
        query: Search query (movie title or natural language)
        country: Optional country code from iOS app (e.g., "US", "GB")
        
    Returns:
        List of matching movies with streaming availability
    """
    try:
        # Get user's country (from app hint or IP geolocation)
        country_code = await geolocation.get_country_with_app_hint(request, country)
        
        # Perform smart search
        results = await smart_search_service.search_movies(query, country_code)
        
        # Add streaming providers to results if country is known
        if country_code and results:
            for movie in results:
                movie_id = movie.get("id")
                if movie_id:
                    # Fetch full details with streaming info
                    full_details = await tmdb.get_movie_details(movie_id, country_code)
                    if full_details and "streaming_providers" in full_details:
                        movie["streaming_providers"] = full_details["streaming_providers"]
        
        return {
            "query": query,
            "country": country_code,
            "results": results,
            "count": len(results)
        }
        
    except Exception as e:
        print(f"Smart search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/movie/{movie_id}")
async def get_movie_with_streaming(
    movie_id: str,
    request: Request,
    country: Optional[str] = None
):
    """
    Get movie details with region-specific streaming availability
    
    Args:
        movie_id: TMDB movie ID
        country: Optional country code from app
        
    Returns:
        Movie data with streaming providers for user's region
    """
    try:
        # Get user's country
        country_code = await geolocation.get_country_with_app_hint(request, country)
        
        # Get movie with streaming info
        movie = await tmdb.get_movie_details(int(movie_id), country_code)
        
        if not movie:
            raise HTTPException(status_code=404, detail="Movie not found")
        
        return {
            "movie": movie,
            "region": country_code
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------------
# Background Tasks
# ---------------------------------------------------------------------------

async def process_instagram_message(data: dict):
    """Process all Instagram messages (text + video)"""
    try:
        for msg in _extract_instagram_messages(data):
            sender_id = msg["sender_id"]

            if msg["type"] == "text":
                print(f"📩 IG text from {sender_id}: {msg['text']}")
                await _handle_text_message(sender_id, msg["text"], platform="instagram")

            elif msg["type"] == "video":
                print(f"📩 IG video from {sender_id}")
                await _handle_video_identification(
                    sender_id, msg["video_url"], platform="instagram"
                )

            elif msg["type"] == "image":
                await _send_reply(
                    sender_id,
                    "🎬 Send me a video clip and I'll tell you which movie or TV show it's from!",
                    platform="instagram",
                )
    except Exception as e:
        print(f"Error processing Instagram message: {e}")


async def process_tiktok_message(data: dict):
    """Process TikTok Business Messaging webhook (im_receive_msg)"""
    try:
        for msg in tiktok.parse_webhook(data):
            biz_id = msg["business_id"]
            conv_id = msg["conversation_id"]
            sender = msg["sender_id"]

            if msg["type"] == "text":
                print(f"📩 TT text from {sender}: {msg['text']}")
                await _handle_text_message(
                    biz_id, msg["text"],
                    platform="tiktok", conversation_id=conv_id,
                )

            elif msg["type"] == "video":
                print(f"📩 TT video from {sender} (media_id: {msg['media_id']})")
                video_path = await tiktok.download_media(biz_id, msg["media_id"])
                if not video_path:
                    await _send_reply(
                        biz_id,
                        "😕 Couldn't download the video. Try sending it again!",
                        platform="tiktok", conversation_id=conv_id,
                    )
                    return
                await _handle_video_identification(
                    biz_id, video_path,
                    platform="tiktok", conversation_id=conv_id,
                )

            elif msg["type"] == "image":
                await _send_reply(
                    biz_id,
                    "🎬 Send me a video clip and I'll tell you which movie or TV show it's from!",
                    platform="tiktok", conversation_id=conv_id,
                )
    except Exception as e:
        print(f"Error processing TikTok message: {e}")


# ---------------------------------------------------------------------------
# Shared handlers
# ---------------------------------------------------------------------------

async def _send_reply(
    user_id: str,
    text: str,
    platform: str,
    conversation_id: Optional[str] = None,
):
    """Send a reply via the correct platform service"""
    if platform == "instagram":
        await instagram.send_message(user_id, text)
    else:
        await tiktok.send_message(
            business_id=user_id,
            conversation_id=conversation_id or "",
            text=text,
        )


async def _handle_text_message(
    user_id: str,
    text: str,
    platform: str,
    conversation_id: Optional[str] = None,
):
    """Reply to text messages prompting the user to send a video instead"""
    await _send_reply(
        user_id,
        "🎬 Send me a video clip and I'll tell you which movie or TV show it's from!",
        platform,
        conversation_id=conversation_id,
    )


async def _handle_video_identification(
    user_id: str,
    video_url: str,
    platform: str,
    conversation_id: Optional[str] = None,
):
    """Identify movie from video clip and reply with just the VLM answer"""
    result = await identify_movie_from_video(video_url)

    if not result["success"]:
        await _send_reply(
            user_id,
            "😕 Couldn't identify this movie. Try a clearer scene!",
            platform,
            conversation_id=conversation_id,
        )
        return

    await _send_reply(
        user_id, result["vlm_response"], platform,
        conversation_id=conversation_id,
    )


# ---------------------------------------------------------------------------
# Payload extraction
# ---------------------------------------------------------------------------

def _extract_instagram_messages(data: dict) -> list[dict]:
    """
    Extract all messages from Instagram webhook payload.
    Returns list of dicts: {type: "text"|"video"|"image", sender_id, text?, video_url?}
    """
    messages: list[dict] = []
    for entry in data.get("entry", []):
        events = entry.get("messaging", []) or entry.get("messaging_events", [])
        for event in events:
            sender_id = event.get("sender", {}).get("id")
            if not sender_id:
                continue

            msg = event.get("message", {}) or {}
            has_media = False

            for att in msg.get("attachments", []) or []:
                att_type = att.get("type", "")
                payload = att.get("payload", {}) or {}

                if att_type == "video":
                    video_url = payload.get("url") or payload.get("video_url") or payload.get("src")
                    if video_url:
                        messages.append({"type": "video", "sender_id": sender_id, "video_url": video_url})
                        has_media = True

                elif att_type == "image":
                    messages.append({"type": "image", "sender_id": sender_id})
                    has_media = True

            if not has_media:
                text = msg.get("text", "").strip()
                if text:
                    messages.append({"type": "text", "sender_id": sender_id, "text": text})

    return messages



async def identify_movie_from_video(video_url: str) -> dict:
    """
    Main pipeline: Video → Frames → VLM → TMDB → Result
    Target: 5-10 seconds total
    """
    try:
        # Cache by video URL hash to avoid re-processing
        video_hash = hashlib.sha256(video_url.encode()).hexdigest()
        cached = tmdb.cache.get_vlm_identification(video_hash)
        if cached:
            return cached

        # 1. Download and extract frames (1-2s)
        frames = await video_processor.extract_key_frames(video_url, num_frames=3)
        
        if not frames:
            return {"success": False, "error": "Failed to extract frames"}
        
        # 2. Identify with VLM (2-3s)
        vlm_response = await openrouter.identify_movie(frames)
        
        if not vlm_response:
            return {"success": False, "error": "VLM identification failed"}
        
        # 3. Verify with TMDB (1s)
        movie = await tmdb.search_and_verify(vlm_response)
        
        if not movie:
            return {"success": False, "error": "Could not verify movie in database"}
        
        result = {
            "success": True,
            "movie": movie,
            "vlm_response": vlm_response,
            "confidence": "high"
        }

        tmdb.cache.set_vlm_identification(video_hash, result)
        return result
        
    except Exception as e:
        print(f"Error in identify_movie_from_video: {e}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
