"""
Smart Search Service
Natural language movie search using LLM query parsing
"""

import json
from typing import List, Dict, Optional
from services.openrouter_service import OpenRouterService
from services.tmdb_service import TMDBService

class SmartSearchService:
    """
    Intelligent movie search that understands natural language queries
    
    Examples:
        "Inception" → Direct TMDB search
        "movies about dreams" → LLM-parsed search
        "funny 90s movies with Jim Carrey" → Advanced filtered search
    """
    
    def __init__(self, openrouter: OpenRouterService, tmdb: TMDBService):
        self.openrouter = openrouter
        self.tmdb = tmdb
    
    async def search_movies(self, query: str, country_code: str = "US") -> List[Dict]:
        """
        Search for movies using natural language or direct title
        
        Args:
            query: User search query (natural or direct)
            country_code: User's country for streaming availability
            
        Returns:
            List of movies matching the query
        """
        # Detect if direct search or natural language
        if self._is_direct_search(query):
            # Direct TMDB search
            print(f"📝 Direct search: {query}")
            return await self.tmdb.search_movie(query)
        
        # Natural language search - use LLM to parse
        print(f"🤖 LLM-enhanced search: {query}")
        search_params = await self._parse_query_with_llm(query)
        
        if not search_params:
            # LLM parsing failed, fallback to direct search
            return await self.tmdb.search_movie(query)
        
        # Search TMDB with parsed parameters
        return await self._search_with_params(search_params, country_code)
    
    def _is_direct_search(self, query: str) -> bool:
        """
        Detect if query is a direct movie title or natural language
        
        Heuristic: Short queries without natural language indicators
        are likely direct movie titles
        """
        query_lower = query.lower().strip()
        
        # Natural language indicators
        nl_indicators = [
            "about", "like", "similar", "movies", "films", "shows",
            "with", "starring", "directed by", "from",
            "funny", "sad", "scary", "action", "comedy", "drama",
            "what", "which", "find", "recommend", "suggestion"
        ]
        
        # If query contains any NL indicator, it's natural language
        if any(indicator in query_lower for indicator in nl_indicators):
            return False
        
        # If query is short (1-3 words) without indicators, likely a title
        word_count = len(query.split())
        if word_count <= 3:
            return True
        
        return False
    
    async def _parse_query_with_llm(self, query: str) -> Optional[Dict]:
        """
        Parse natural language query into structured search parameters
        
        Args:
            query: Natural language query
            
        Returns:
            Dict with search parameters or None if parsing failed
        """
        prompt = f"""Parse this movie search query into structured parameters.

Query: "{query}"

Extract these fields (only include if explicitly mentioned):
- search_terms: Main keywords to search for (array of strings)
- genres: Movie genres (array, choose from: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, Thriller, War, Western)
- year_range: [min_year, max_year] if years/decades mentioned
- actors: Actor names if mentioned (array)
- director: Director name if mentioned (string)
- mood: Overall tone/mood if mentioned (string)

Return ONLY valid JSON. Omit fields that aren't mentioned.

Examples:
Query: "funny robot movies from the 90s"
Output: {{"search_terms": ["robot", "artificial intelligence"], "genres": ["Comedy", "Science Fiction"], "year_range": [1990, 1999]}}

Query: "movies like Inception"
Output: {{"search_terms": ["inception", "dreams", "mind bending"], "genres": ["Science Fiction", "Thriller"]}}

Query: "Christopher Nolan films"
Output: {{"director": "Christopher Nolan"}}

Now parse the query."""

        try:
            response = await self.openrouter.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                model="openai/gpt-4o-mini",  # Fast and cheap for parsing
                max_tokens=200
            )
            
            # Extract JSON from response (handle markdown code blocks)
            content = response.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            params = json.loads(content)
            print(f"✅ Parsed params: {params}")
            return params
            
        except Exception as e:
            print(f"❌ LLM parsing error: {e}")
            return None
    
    async def _search_with_params(
        self,
        params: Dict,
        country_code: str = "US"
    ) -> List[Dict]:
        """
        Search TMDB using parsed parameters and apply filters
        
        Args:
            params: Parsed search parameters
            country_code: User's country code
            
        Returns:
            Filtered list of movies
        """
        # Build search query from terms
        search_terms = params.get("search_terms", [])
        if params.get("director"):
            search_terms.append(params["director"])
        if params.get("actors"):
            search_terms.extend(params["actors"][:2])  # Add up to 2 actors
        
        search_query = " ".join(search_terms) if search_terms else ""
        
        # If no search terms, use genre search
        if not search_query and params.get("genres"):
            search_query = params["genres"][0]  # Use first genre as keyword
        
        # Search TMDB
        if not search_query:
            return []
        
        movies = await self.tmdb.search_movie(search_query)
        
        # Apply filters
        filtered = movies
        
        # Filter by genres
        if "genres" in params and params["genres"]:
            filtered = [
                m for m in filtered
                if any(genre in m.get("genres", []) for genre in params["genres"])
            ]
        
        # Filter by year range
        if "year_range" in params:
            min_year, max_year = params["year_range"]
            filtered = [
                m for m in filtered
                if m.get("year") and min_year <= int(m["year"]) <= max_year
            ]
        
        # Filter by director (case-insensitive partial match)
        if "director" in params and params["director"]:
            director_query = params["director"].lower()
            filtered = [
                m for m in filtered
                if m.get("director") and director_query in m["director"].lower()
            ]
        
        # Filter by actors
        if "actors" in params and params["actors"]:
            actor_queries = [actor.lower() for actor in params["actors"]]
            filtered = [
                m for m in filtered
                if m.get("cast") and any(
                    any(actor_query in cast_member.lower() for actor_query in actor_queries)
                    for cast_member in m["cast"]
                )
            ]
        
        print(f"🎬 Found {len(filtered)} movies after filtering")
        
        # Return top 10 results
        return filtered[:10]
