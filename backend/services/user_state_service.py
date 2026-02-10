"""
User State Service
Manages user journey states for social media interactions
"""

import secrets
from datetime import datetime, timedelta
from typing import Optional, Tuple
from constants.user_states import UserState, Platform
from constants.app_constants import (
    MESSAGE_TEMPLATES,
    APP_STORE_URL,
    DEEP_LINK_LINK_ACCOUNT,
    LINK_TOKEN_EXPIRY_HOURS
)
from types.social_media import SocialMediaUser, UserStateResponse

class UserStateService:
    """
    Manages user states and generates appropriate responses
    based on user journey stage
    """
    
    def __init__(self, db_client=None):
        """
        Initialize user state service
        
        Args:
            db_client: Database client (Supabase or similar)
        """
        self.db = db_client
    
    async def get_user_state(
        self,
        platform: Platform,
        platform_user_id: str
    ) -> Tuple[UserState, Optional[SocialMediaUser]]:
        """
        Determine user state based on interaction history
        
        Args:
            platform: Social media platform
            platform_user_id: Platform-specific user ID
            
        Returns:
            Tuple of (UserState, Optional[SocialMediaUser])
        """
        # Check if user exists in database
        user = await self._get_social_media_user(platform, platform_user_id)
        
        if not user:
            # New user - first interaction ever
            await self._create_social_media_user(platform, platform_user_id)
            return (UserState.NEW_USER, None)
        
        # Update interaction tracking
        await self._update_last_message(user["id"])
        
        # Check linking status
        if user.get("is_linked") and user.get("app_user_id"):
            return (UserState.LINKED_USER, user)
        else:
            return (UserState.RETURNING_USER, user)
    
    async def generate_response(
        self,
        state: UserState,
        movie: dict,
        platform: Platform,
        platform_user_id: str,
        user_data: Optional[dict] = None
    ) -> UserStateResponse:
        """
        Generate appropriate response based on user state
        
        Args:
            state: Current user state
            movie: Movie data from TMDB
            platform: Social media platform
            platform_user_id: Platform-specific user ID
            user_data: Optional user data
            
        Returns:
            UserStateResponse with message and save flag
        """
        # Prepare movie data for template
        movie_context = {
            "movie_title": movie.get("title", "Unknown"),
            "movie_year": movie.get("year", "N/A"),
            "movie_rating": movie.get("rating", "N/A"),
            "movie_overview": movie.get("overview", "")[:150] + "...",
            "app_store_url": APP_STORE_URL
        }
        
        if state == UserState.NEW_USER:
            # First time - show app download link
            message = MESSAGE_TEMPLATES["new_user"].format(**movie_context)
            should_save = False
            
        elif state == UserState.RETURNING_USER:
            # Has used bot before - offer account linking
            token = await self._create_link_token(platform, platform_user_id)
            deep_link = f"{DEEP_LINK_LINK_ACCOUNT}?token={token}"
            
            movie_context["deep_link"] = deep_link
            message = MESSAGE_TEMPLATES["returning_user"].format(**movie_context)
            should_save = False
            
        else:  # UserState.LINKED_USER
            # Account linked - auto-save clip
            message = MESSAGE_TEMPLATES["linked_user"].format(**movie_context)
            should_save = True
        
        return UserStateResponse(
            state=state.value,
            user_data=user_data,
            should_save_clip=should_save,
            response_message=message
        )
    
    async def link_account(
        self,
        app_user_id: str,
        link_token: str
    ) -> dict:
        """
        Link social media account to app user account
        
        Args:
            app_user_id: App user ID from Supabase
            link_token: One-time link token
            
        Returns:
            Result dict with success status and platform
        """
        # Verify token
        token_data = await self._get_link_token(link_token)
        
        if not token_data:
            return {"success": False, "error": "Invalid token"}
        
        if token_data.get("used"):
            return {"success": False, "error": "Token already used"}
        
        if token_data.get("expires_at") < datetime.now():
            return {"success": False, "error": "Token expired"}
        
        # Link accounts in database
        await self._link_accounts(
            app_user_id=app_user_id,
            platform=token_data["platform"],
            platform_user_id=token_data["platform_user_id"]
        )
        
        # Mark token as used
        await self._mark_token_used(link_token)
        
        return {
            "success": True,
            "platform": token_data["platform"],
            "message": MESSAGE_TEMPLATES["link_success"]
        }
    
    # Private helper methods (database operations)
    
    async def _get_social_media_user(
        self,
        platform: Platform,
        platform_user_id: str
    ) -> Optional[dict]:
        """Get social media user from database"""
        if not self.db:
            return None
        
        # TODO: Implement actual database query
        # return await self.db.table("social_media_users").select("*").eq(...)
        return None
    
    async def _create_social_media_user(
        self,
        platform: Platform,
        platform_user_id: str
    ):
        """Create new social media user record"""
        if not self.db:
            return
        
        # TODO: Implement actual database insert
        # await self.db.table("social_media_users").insert({...})
        pass
    
    async def _update_last_message(self, user_id: str):
        """Update last message timestamp and increment count"""
        if not self.db:
            return
        
        # TODO: Implement actual database update
        # await self.db.table("social_media_users").update({...}).eq("id", user_id)
        pass
    
    async def _create_link_token(
        self,
        platform: Platform,
        platform_user_id: str
    ) -> str:
        """Create one-time link token"""
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(hours=LINK_TOKEN_EXPIRY_HOURS)
        
        if self.db:
            # TODO: Implement actual database insert
            # await self.db.table("link_tokens").insert({...})
            pass
        
        return token
    
    async def _get_link_token(self, token: str) -> Optional[dict]:
        """Get link token data"""
        if not self.db:
            return None
        
        # TODO: Implement actual database query
        # return await self.db.table("link_tokens").select("*").eq("token", token).single()
        return None
    
    async def _mark_token_used(self, token: str):
        """Mark token as used"""
        if not self.db:
            return
        
        # TODO: Implement actual database update
        # await self.db.table("link_tokens").update({"used": True}).eq("token", token)
        pass
    
    async def _link_accounts(
        self,
        app_user_id: str,
        platform: Platform,
        platform_user_id: str
    ):
        """Link social media account to app account"""
        if not self.db:
            return
        
        # TODO: Implement actual database update
        # await self.db.table("social_media_users").update({...})
        pass
