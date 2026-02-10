"""User state constants and enums"""

from enum import Enum

class UserState(str, Enum):
    """User journey states for social media interactions"""
    NEW_USER = "new_user"           # First message ever - show app download
    RETURNING_USER = "returning"    # Has message history but not linked - show deep link
    LINKED_USER = "linked"          # Account linked - auto-save clips

class Platform(str, Enum):
    """Supported social media platforms"""
    INSTAGRAM = "instagram"
    TIKTOK = "tiktok"

class LinkStatus(str, Enum):
    """Account linking status"""
    NOT_LINKED = "not_linked"
    PENDING = "pending"
    LINKED = "linked"
    EXPIRED = "expired"
