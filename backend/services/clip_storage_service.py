"""
Clip Storage Service
Handles video clip storage and management
"""

import httpx
from typing import Optional
from datetime import datetime
from constants.user_states import Platform
from constants.app_constants import VIDEO_STORAGE_BUCKET, MAX_CLIP_SIZE_MB

class ClipStorageService:
    """Manages video clip storage to Supabase Storage"""
    
    def __init__(self, storage_client=None):
        """
        Initialize clip storage service
        
        Args:
            storage_client: Supabase storage client
        """
        self.storage = storage_client
    
    async def save_clip_to_library(
        self,
        app_user_id: str,
        movie: dict,
        video_url: str,
        platform: Platform
    ) -> dict:
        """
        Download, upload, and save video clip to user's library
        
        Args:
            app_user_id: App user ID
            movie: Movie data from TMDB
            video_url: Original video URL
            platform: Social media platform
            
        Returns:
            Dict with clip data and status
        """
        try:
            # 1. Download video from platform
            video_data = await self._download_video(video_url)
            
            if not video_data:
                return {"success": False, "error": "Failed to download video"}
            
            # Check size
            if len(video_data) > MAX_CLIP_SIZE_MB * 1024 * 1024:
                return {
                    "success": False,
                    "error": f"Video too large (max {MAX_CLIP_SIZE_MB}MB)"
                }
            
            # 2. Upload to storage
            storage_path = await self._upload_to_storage(
                video_data=video_data,
                app_user_id=app_user_id,
                movie_id=str(movie["id"]),
                platform=platform
            )
            
            if not storage_path:
                return {"success": False, "error": "Failed to upload video"}
            
            # 3. Save clip metadata to database
            clip_data = await self._save_clip_metadata(
                app_user_id=app_user_id,
                movie=movie,
                original_url=video_url,
                stored_url=storage_path,
                platform=platform,
                file_size=len(video_data)
            )
            
            # 4. Add/update movie in user's library
            await self._add_movie_to_library(app_user_id, movie)
            
            return {
                "success": True,
                "clip_id": clip_data.get("id"),
                "storage_url": storage_path
            }
            
        except Exception as e:
            print(f"Error saving clip: {e}")
            return {"success": False, "error": str(e)}
    
    async def _download_video(self, video_url: str) -> Optional[bytes]:
        """Download video from URL"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    video_url,
                    follow_redirects=True,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.content
                
                return None
                
        except Exception as e:
            print(f"Error downloading video: {e}")
            return None
    
    async def _upload_to_storage(
        self,
        video_data: bytes,
        app_user_id: str,
        movie_id: str,
        platform: Platform
    ) -> Optional[str]:
        """Upload video to Supabase Storage"""
        if not self.storage:
            print("Storage client not configured")
            return None
        
        try:
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{app_user_id}/{movie_id}_{platform.value}_{timestamp}.mp4"
            
            # Upload to Supabase Storage
            # TODO: Implement actual Supabase storage upload
            # response = self.storage.from_(VIDEO_STORAGE_BUCKET).upload(
            #     path=filename,
            #     file=video_data,
            #     file_options={"content-type": "video/mp4"}
            # )
            
            # Return public URL
            storage_url = f"https://your-project.supabase.co/storage/v1/object/public/{VIDEO_STORAGE_BUCKET}/{filename}"
            return storage_url
            
        except Exception as e:
            print(f"Error uploading to storage: {e}")
            return None
    
    async def _save_clip_metadata(
        self,
        app_user_id: str,
        movie: dict,
        original_url: str,
        stored_url: str,
        platform: Platform,
        file_size: int
    ) -> dict:
        """Save clip metadata to database"""
        # TODO: Implement actual database insert
        # clip_data = await db.table("movie_clips").insert({
        #     "app_user_id": app_user_id,
        #     "movie_id": str(movie["id"]),
        #     "platform": platform.value,
        #     "original_video_url": original_url,
        #     "stored_video_url": stored_url,
        #     "file_size_bytes": file_size,
        # }).execute()
        
        return {"id": "placeholder", "stored_url": stored_url}
    
    async def _add_movie_to_library(self, app_user_id: str, movie: dict):
        """Add movie to user's library if not already there"""
        # TODO: Implement actual database upsert
        # await db.table("movies").upsert({
        #     "user_id": app_user_id,
        #     "tmdb_id": str(movie["id"]),
        #     "title": movie["title"],
        #     "year": movie.get("year"),
        #     "poster_url": movie.get("poster_url"),
        #     "rating": movie.get("rating"),
        #     "watch_status": "watchLater"
        # }, on_conflict="user_id,tmdb_id").execute()
        pass
    
    async def get_user_clips(
        self,
        app_user_id: str,
        movie_id: Optional[str] = None
    ) -> list:
        """Get all clips for a user, optionally filtered by movie"""
        # TODO: Implement actual database query
        # query = db.table("movie_clips").select("*").eq("app_user_id", app_user_id)
        # if movie_id:
        #     query = query.eq("movie_id", movie_id)
        # return await query.execute()
        return []
