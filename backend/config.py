"""
Configuration settings for the backend
Loads from environment variables
"""

from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # API Keys
    OPENROUTER_API_KEY: str = ""
    TMDB_API_KEY: str = ""
    INSTAGRAM_VERIFY_TOKEN: str = ""
    INSTAGRAM_ACCESS_TOKEN: str = ""
    TIKTOK_ACCESS_TOKEN: str = ""
    
    # OpenRouter Configuration
    OPENROUTER_MODEL: str = "google/gemini-flash-1.5-8b"  # Fast & cheap
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    
    # TMDB Configuration
    TMDB_BASE_URL: str = "https://api.themoviedb.org/3"
    TMDB_IMAGE_BASE_URL: str = "https://image.tmdb.org/t/p"
    
    # Video Processing
    MAX_VIDEO_SIZE_MB: int = 50
    NUM_FRAMES_TO_EXTRACT: int = 3
    FRAME_QUALITY: int = 85
    
    # Performance
    REQUEST_TIMEOUT: int = 30
    MAX_CONCURRENT_REQUESTS: int = 10
    
    # Paths
    TEMP_DIR: str = "/tmp/movielibrary"
    
    # Redis Cache Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
