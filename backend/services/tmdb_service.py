"""
TMDB Service
Verifies movie identifications and fetches metadata
"""

import httpx
import re
from typing import Optional, Dict
from config import settings
from services.cache_service import CacheService

class TMDBService:
    def __init__(self):
        self.api_key = settings.TMDB_API_KEY
        self.base_url = settings.TMDB_BASE_URL
        self.image_base_url = settings.TMDB_IMAGE_BASE_URL
        
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=settings.REQUEST_TIMEOUT
        )
        
        # Initialize cache
        self.cache = CacheService()
    
    async def health_check(self) -> bool:
        """Check if TMDB API is accessible"""
        try:
            response = await self.client.get(
                "/configuration",
                params={"api_key": self.api_key}
            )
            return response.status_code == 200
        except:
            return False
    
    def parse_vlm_response(self, vlm_response: str) -> tuple[Optional[str], Optional[str]]:
        """
        Parse VLM response to extract title and year
        
        Examples:
            "Inception (2010)" -> ("Inception", "2010")
            "The Dark Knight (2008)" -> ("The Dark Knight", "2008")
            "Breaking Bad S01E01 (2008)" -> ("Breaking Bad", "2008")
        """
        # Try to extract year in parentheses
        year_match = re.search(r'\((\d{4})\)', vlm_response)
        year = year_match.group(1) if year_match else None
        
        # Extract title (everything before the year)
        if year_match:
            title = vlm_response[:year_match.start()].strip()
            # Remove season/episode info for TV shows
            title = re.sub(r'\s+S\d+E\d+', '', title, flags=re.IGNORECASE)
        else:
            title = vlm_response.strip()
        
        return title, year
    
    async def search_movie(self, query: str, year: Optional[str] = None) -> Optional[Dict]:
        """
        Search for movie in TMDB with caching
        
        Args:
            query: Movie title
            year: Release year (optional)
            
        Returns:
            Movie data dict or None
        """
        # Check cache first
        cached_result = self.cache.get_search(query, year)
        if cached_result:
            return cached_result
        
        # Cache miss - call API
        print(f"🌐 TMDB API call: searching '{query}' ({year or 'any year'})")
        
        try:
            params = {
                "api_key": self.api_key,
                "query": query,
                "page": 1
            }
            
            if year:
                params["year"] = year
            
            response = await self.client.get("/search/movie", params=params)
            
            if response.status_code != 200:
                print(f"TMDB search error: {response.status_code}")
                return None
            
            data = response.json()
            results = data.get("results", [])
            
            if not results:
                return None
            
            # Get the top result
            movie = results[0]
            
            # Fetch full details
            movie_details = await self.get_movie_details(movie["id"])
            
            # Cache the result
            if movie_details:
                self.cache.set_search(query, year, movie_details)
            
            return movie_details
            
        except Exception as e:
            print(f"Error searching TMDB: {e}")
            return None
    
    async def get_movie_details(
        self,
        movie_id: int,
        country_code: Optional[str] = None
    ) -> Optional[Dict]:
        """
        Get detailed information about a movie with caching
        
        Args:
            movie_id: TMDB movie ID
            country_code: Optional country code for streaming providers
            
        Returns:
            Detailed movie data
        """
        # Check cache first (without streaming data)
        cached_movie = self.cache.get_movie(str(movie_id))
        if cached_movie and not country_code:
            return cached_movie
        
        # Cache miss - call API
        print(f"🌐 TMDB API call: movie details for ID {movie_id}")
        
        try:
            response = await self.client.get(
                f"/movie/{movie_id}",
                params={
                    "api_key": self.api_key,
                    "append_to_response": "credits,videos,watch/providers"
                }
            )
            
            if response.status_code != 200:
                return None
            
            data = response.json()
            
            # Format response
            movie_data = {
                "id": data["id"],
                "title": data["title"],
                "year": data["release_date"][:4] if data.get("release_date") else None,
                "overview": data.get("overview", ""),
                "rating": round(data.get("vote_average", 0), 1),
                "poster_url": f"{self.image_base_url}/w500{data['poster_path']}" if data.get("poster_path") else None,
                "backdrop_url": f"{self.image_base_url}/w1280{data['backdrop_path']}" if data.get("backdrop_path") else None,
                "genres": [g["name"] for g in data.get("genres", [])],
                "runtime": data.get("runtime"),
                "director": self._extract_director(data.get("credits", {})),
                "cast": self._extract_cast(data.get("credits", {})),
                "trailer_url": self._extract_trailer(data.get("videos", {}))
            }
            
            # Add streaming providers if country specified
            if country_code:
                movie_data["streaming_providers"] = self._extract_watch_providers(
                    data.get("watch/providers", {}),
                    country_code
                )
            
            # Cache the result (without streaming data for reusability)
            base_movie_data = {k: v for k, v in movie_data.items() if k != "streaming_providers"}
            self.cache.set_movie(str(movie_id), base_movie_data)
            
            return movie_data
            
        except Exception as e:
            print(f"Error getting movie details: {e}")
            return None
    
    def _extract_director(self, credits: Dict) -> Optional[str]:
        """Extract director name from credits"""
        crew = credits.get("crew", [])
        for person in crew:
            if person.get("job") == "Director":
                return person.get("name")
        return None
    
    def _extract_cast(self, credits: Dict) -> list[str]:
        """Extract top cast names"""
        cast = credits.get("cast", [])
        return [person["name"] for person in cast[:10]]
    
    def _extract_trailer(self, videos: Dict) -> Optional[str]:
        """Extract YouTube trailer URL"""
        results = videos.get("results", [])
        for video in results:
            if video.get("site") == "YouTube" and video.get("type") == "Trailer":
                return f"https://www.youtube.com/watch?v={video['key']}"
        return None
    
    def _extract_watch_providers(self, providers_data: Dict, country_code: str) -> Dict:
        """
        Extract streaming providers for specific country
        
        Args:
            providers_data: Watch providers data from TMDB
            country_code: Country code (e.g., "US", "GB")
            
        Returns:
            Dict with categorized providers (stream, buy, rent, free)
        """
        results = providers_data.get("results", {})
        country_data = results.get(country_code, {})
        
        return {
            "stream": country_data.get("flatrate", []),  # Subscription streaming
            "buy": country_data.get("buy", []),
            "rent": country_data.get("rent", []),
            "free": country_data.get("free", []),
            "link": country_data.get("link", "")  # TMDB link for more info
        }
    
    async def search_and_verify(self, vlm_response: str) -> Optional[Dict]:
        """
        Complete pipeline: Parse VLM response and verify with TMDB
        
        Args:
            vlm_response: Raw response from VLM (e.g., "Inception (2010)")
            
        Returns:
            Verified movie data or None
        """
        title, year = self.parse_vlm_response(vlm_response)
        
        if not title:
            print(f"Could not parse title from: {vlm_response}")
            return None
        
        print(f"Searching TMDB for: {title} ({year or 'any year'})")
        
        movie = await self.search_movie(title, year)
        
        if movie:
            print(f"Found: {movie['title']} ({movie['year']})")
        else:
            print(f"No match found in TMDB")
        
        return movie
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
