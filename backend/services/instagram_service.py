"""
Instagram Service
Handles Instagram Graph API integration
"""

import httpx
from typing import Optional
from config import settings

class InstagramService:
    def __init__(self):
        self.access_token = settings.INSTAGRAM_ACCESS_TOKEN
        self.base_url = "https://graph.facebook.com/v18.0"
        
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=settings.REQUEST_TIMEOUT
        )
    
    async def send_message(self, recipient_id: str, message: str) -> bool:
        """
        Send message to Instagram user
        
        Args:
            recipient_id: Instagram user ID (PSID)
            message: Message text to send
            
        Returns:
            Success status
        """
        try:
            response = await self.client.post(
                "/me/messages",
                params={"access_token": self.access_token},
                json={
                    "recipient": {"id": recipient_id},
                    "message": {"text": message}
                }
            )
            
            if response.status_code == 200:
                print(f"Message sent to {recipient_id}")
                return True
            else:
                print(f"Failed to send message: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"Error sending Instagram message: {e}")
            return False
    
    async def send_template_message(
        self,
        recipient_id: str,
        movie_title: str,
        poster_url: Optional[str] = None
    ) -> bool:
        """
        Send rich message with movie poster
        
        Args:
            recipient_id: Instagram user ID
            movie_title: Movie title
            poster_url: URL to movie poster
            
        Returns:
            Success status
        """
        try:
            # Build message payload
            payload = {
                "recipient": {"id": recipient_id},
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [
                                {
                                    "title": movie_title,
                                    "image_url": poster_url or "https://via.placeholder.com/300x450",
                                    "buttons": [
                                        {
                                            "type": "web_url",
                                            "url": f"https://www.themoviedb.org/search?query={movie_title}",
                                            "title": "View on TMDB"
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
            
            response = await self.client.post(
                "/me/messages",
                params={"access_token": self.access_token},
                json=payload
            )
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"Error sending template message: {e}")
            return False
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
