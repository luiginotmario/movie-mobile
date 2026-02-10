"""
Redis Cache Service
Caches TMDB API responses to reduce redundant API calls
"""

import redis
import json
from typing import Optional, Dict
from config import settings

class CacheService:
    def __init__(self):
        """Initialize Redis connection"""
        try:
            self.client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            # Test connection
            self.client.ping()
            self.enabled = True
            print("✅ Redis cache connected")
        except Exception as e:
            print(f"⚠️  Redis connection failed: {e}")
            print("📝 Running without cache (will call TMDB API every time)")
            self.enabled = False
            self.client = None
        
        # TTLs in seconds
        self.MOVIE_TTL = 30 * 24 * 3600  # 30 days - movies don't change often
        self.SEARCH_TTL = 7 * 24 * 3600   # 7 days - search results
        self.VLM_TTL = 90 * 24 * 3600     # 90 days - VLM identifications (rarely change)
    
    def _safe_operation(self, operation, default=None):
        """Safely execute Redis operation with fallback"""
        if not self.enabled or not self.client:
            return default
        try:
            return operation()
        except Exception as e:
            print(f"Redis error: {e}")
            return default
    
    # Movie Details Cache
    def get_movie(self, movie_id: str) -> Optional[Dict]:
        """
        Get cached movie details by TMDB ID
        
        Args:
            movie_id: TMDB movie ID
            
        Returns:
            Movie data dict or None
        """
        def _get():
            key = f"movie:{movie_id}"
            data = self.client.get(key)
            if data:
                print(f"💾 Cache hit: movie ID {movie_id}")
                return json.loads(data)
            return None
        
        return self._safe_operation(_get)
    
    def set_movie(self, movie_id: str, data: Dict):
        """
        Cache movie details
        
        Args:
            movie_id: TMDB movie ID
            data: Full movie data dict
        """
        def _set():
            key = f"movie:{movie_id}"
            self.client.setex(
                key,
                self.MOVIE_TTL,
                json.dumps(data)
            )
            print(f"💾 Cached: movie ID {movie_id}")
        
        self._safe_operation(_set)
    
    # Search Results Cache
    def get_search(self, query: str, year: Optional[str] = None) -> Optional[Dict]:
        """
        Get cached search results
        
        Args:
            query: Movie title search query
            year: Optional year filter
            
        Returns:
            Movie data dict or None
        """
        def _get():
            # Normalize key
            normalized_query = query.lower().strip()
            key = f"search:{normalized_query}:{year or 'any'}"
            data = self.client.get(key)
            if data:
                print(f"💾 Cache hit: search '{query}' ({year or 'any year'})")
                return json.loads(data)
            return None
        
        return self._safe_operation(_get)
    
    def set_search(self, query: str, year: Optional[str], data: Dict):
        """
        Cache search results
        
        Args:
            query: Movie title search query
            year: Optional year filter
            data: Movie data dict
        """
        def _set():
            normalized_query = query.lower().strip()
            key = f"search:{normalized_query}:{year or 'any'}"
            self.client.setex(
                key,
                self.SEARCH_TTL,
                json.dumps(data)
            )
            print(f"💾 Cached: search '{query}' ({year or 'any year'})")
        
        self._safe_operation(_set)
    
    # VLM Response Cache (for video clips)
    def get_vlm_identification(self, video_hash: str) -> Optional[Dict]:
        """
        Get cached VLM identification for a video
        
        Args:
            video_hash: Hash of video URL or frames
            
        Returns:
            Identification result or None
        """
        def _get():
            key = f"vlm:{video_hash}"
            data = self.client.get(key)
            if data:
                print(f"💾 Cache hit: VLM identification {video_hash[:12]}...")
                return json.loads(data)
            return None
        
        return self._safe_operation(_get)
    
    def set_vlm_identification(self, video_hash: str, data: Dict):
        """
        Cache VLM identification result
        
        Args:
            video_hash: Hash of video URL or frames
            data: Identification result
        """
        def _set():
            key = f"vlm:{video_hash}"
            self.client.setex(
                key,
                self.VLM_TTL,
                json.dumps(data)
            )
            print(f"💾 Cached: VLM identification {video_hash[:12]}...")
        
        self._safe_operation(_set)
    
    # Cache Statistics
    def get_stats(self) -> Dict:
        """Get cache statistics"""
        if not self.enabled:
            return {"enabled": False}
        
        def _get_stats():
            info = self.client.info("stats")
            memory = self.client.info("memory")
            
            return {
                "enabled": True,
                "total_keys": self.client.dbsize(),
                "hits": info.get("keyspace_hits", 0),
                "misses": info.get("keyspace_misses", 0),
                "memory_used": memory.get("used_memory_human", "N/A"),
                "hit_rate": self._calculate_hit_rate(
                    info.get("keyspace_hits", 0),
                    info.get("keyspace_misses", 0)
                )
            }
        
        return self._safe_operation(_get_stats, {"enabled": False})
    
    def _calculate_hit_rate(self, hits: int, misses: int) -> str:
        """Calculate cache hit rate percentage"""
        total = hits + misses
        if total == 0:
            return "0%"
        return f"{(hits / total * 100):.1f}%"
    
    def clear_all(self):
        """Clear all cache (use with caution!)"""
        if self.enabled:
            self.client.flushdb()
            print("🗑️  Cache cleared")
    
    def health_check(self) -> bool:
        """Check if Redis is healthy"""
        if not self.enabled:
            return False
        try:
            return self.client.ping()
        except:
            return False
