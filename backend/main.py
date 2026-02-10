"""
FastAPI Backend for MovieLibrary
Handles Instagram/TikTok webhooks and movie identification via VLM
"""

from fastapi import FastAPI, Request, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import httpx
from typing import Optional

from services.video_processor import VideoProcessor
from services.openrouter_service import OpenRouterService
from services.tmdb_service import TMDBService
from services.instagram_service import InstagramService
from services.tiktok_service import TikTokService
from config import settings

# Initialize services
video_processor = VideoProcessor()
openrouter = OpenRouterService()
tmdb = TMDBService()
instagram = InstagramService()
tiktok = TikTokService()

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
        }
    }

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
    data = await request.json()
    
    # Respond immediately to avoid timeout
    background_tasks.add_task(process_instagram_message, data)
    
    return {"status": "received"}

# TikTok Webhook
@app.post("/webhook/tiktok")
async def tiktok_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle TikTok webhook events"""
    data = await request.json()
    
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

# Background Tasks
async def process_instagram_message(data: dict):
    """Process Instagram message in background"""
    try:
        # Extract video URL from Instagram payload
        entry = data.get("entry", [])[0]
        messaging = entry.get("messaging", [])[0]
        
        sender_id = messaging.get("sender", {}).get("id")
        
        # Check if message contains video
        if "message" in messaging and "attachments" in messaging["message"]:
            for attachment in messaging["message"]["attachments"]:
                if attachment.get("type") == "video":
                    video_url = attachment.get("payload", {}).get("url")
                    
                    # Identify movie
                    result = await identify_movie_from_video(video_url)
                    
                    # Send response
                    if result["success"]:
                        movie = result["movie"]
                        message = f"🎬 Found it!\n\n{movie['title']} ({movie.get('year', 'N/A')})\n⭐ {movie.get('rating', 'N/A')}/10\n\n{movie.get('overview', '')[:200]}..."
                    else:
                        message = "😕 Couldn't identify this movie. Try a clearer scene or different clip!"
                    
                    await instagram.send_message(sender_id, message)
                    
    except Exception as e:
        print(f"Error processing Instagram message: {e}")

async def process_tiktok_message(data: dict):
    """Process TikTok message in background"""
    try:
        # TikTok webhook payload structure (adjust based on actual API)
        video_url = data.get("video_url")
        user_id = data.get("user_id")
        
        if video_url and user_id:
            result = await identify_movie_from_video(video_url)
            
            if result["success"]:
                movie = result["movie"]
                message = f"🎬 {movie['title']} ({movie.get('year', 'N/A')})"
                await tiktok.send_message(user_id, message)
                
    except Exception as e:
        print(f"Error processing TikTok message: {e}")

async def identify_movie_from_video(video_url: str) -> dict:
    """
    Main pipeline: Video → Frames → VLM → TMDB → Result
    Target: 5-10 seconds total
    """
    try:
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
        
        return {
            "success": True,
            "movie": movie,
            "vlm_response": vlm_response,
            "confidence": "high"
        }
        
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
