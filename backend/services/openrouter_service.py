"""
OpenRouter Service - VLM Integration
Identifies movies from video frames using vision language models
"""

import httpx
import base64
from typing import List, Optional
from config import settings

class OpenRouterService:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.OPENROUTER_BASE_URL
        self.model = settings.OPENROUTER_MODEL
        
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "HTTP-Referer": "https://movielibrary.app",
                "X-Title": "MovieLibrary"
            },
            timeout=settings.REQUEST_TIMEOUT
        )
    
    async def health_check(self) -> bool:
        """Check if OpenRouter API is accessible"""
        try:
            response = await self.client.get("/models")
            return response.status_code == 200
        except:
            return False
    
    async def identify_movie(self, frames: List[bytes]) -> Optional[str]:
        """
        Identify movie from video frames using VLM
        
        Args:
            frames: List of image frames as bytes
            
        Returns:
            Movie identification string (e.g., "Inception (2010)")
        """
        try:
            # Convert frames to base64
            frames_b64 = [base64.b64encode(frame).decode() for frame in frames]
            
            # Build message content
            content = [
                {
                    "type": "text",
                    "text": """Identify the movie or TV show from these frames.
                    
Rules:
- Return ONLY the title and year in format: "Title (Year)"
- Be specific and confident
- If it's a TV show, include "S01E01" format
- If uncertain, provide your best guess
- Do not include any explanation or extra text

Example responses:
- "Inception (2010)"
- "Breaking Bad S01E01 (2008)"
- "The Dark Knight (2008)"
"""
                }
            ]
            
            # Add frames
            for frame_b64 in frames_b64:
                content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{frame_b64}"
                    }
                })
            
            # Make API request
            response = await self.client.post(
                "/chat/completions",
                json={
                    "model": self.model,
                    "messages": [
                        {
                            "role": "user",
                            "content": content
                        }
                    ],
                    "max_tokens": 100,
                    "temperature": 0.3  # Lower temperature for more consistent responses
                }
            )
            
            if response.status_code != 200:
                print(f"OpenRouter API error: {response.status_code} - {response.text}")
                return None
            
            data = response.json()
            result = data["choices"][0]["message"]["content"].strip()
            
            print(f"VLM Response: {result}")
            return result
            
        except Exception as e:
            print(f"Error in identify_movie: {e}")
            return None
    
    async def identify_with_fallback(self, frames: List[bytes]) -> Optional[str]:
        """
        Try multiple models if the first one fails
        """
        models = [
            "google/gemini-flash-1.5-8b",
            "openai/gpt-4o-mini",
            "anthropic/claude-3-haiku"
        ]
        
        for model in models:
            self.model = model
            result = await self.identify_movie(frames)
            if result:
                return result
        
        return None
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
