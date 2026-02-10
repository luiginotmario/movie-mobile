"""Type definitions for social media integration"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from constants.user_states import Platform, LinkStatus

@dataclass
class SocialMediaUser:
    """Social media user profile"""
    id: str
    platform: Platform
    platform_user_id: str
    platform_username: Optional[str]
    first_message_at: datetime
    last_message_at: datetime
    total_messages: int
    is_linked: bool
    app_user_id: Optional[str]
    linked_at: Optional[datetime]

@dataclass
class LinkToken:
    """One-time link token for account linking"""
    token: str
    platform: Platform
    platform_user_id: str
    expires_at: datetime
    used: bool
    created_at: datetime

@dataclass
class MovieClip:
    """Saved movie clip from social media"""
    id: str
    app_user_id: str
    movie_id: str
    platform: Platform
    original_video_url: str
    stored_video_url: Optional[str]
    thumbnail_url: Optional[str]
    duration_seconds: Optional[int]
    file_size_bytes: Optional[int]
    created_at: datetime

@dataclass
class UserStateResponse:
    """Response data for user state"""
    state: str
    user_data: Optional[SocialMediaUser]
    should_save_clip: bool
    response_message: str
