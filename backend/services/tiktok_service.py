"""
TikTok Service
Handles TikTok API integration
"""

import httpx
import hmac
import hashlib
from typing import Optional
from config import settings

class TikTokService:
    def __init__(self):
        self.access_token = settings.TIKTOK_ACCESS_TOKEN
        self.webhook_secret = settings.TIKTOK_WEBHOOK_SECRET
        self.signature_header = settings.TIKTOK_WEBHOOK_SIGNATURE_HEADER
        # TikTok API endpoints (adjust based on actual API documentation)
        self.base_url = "https://open-api.tiktok.com"
        
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=settings.REQUEST_TIMEOUT
        )

    def verify_signature(self, raw_body: bytes, signature_header: Optional[str]) -> bool:
        """
        Verify TikTok webhook signature.
        This uses HMAC SHA256 of raw request body with webhook secret.
        If no secret is configured, skip verification.
        """
        if not self.webhook_secret:
            return True
        if not signature_header:
            return False

        expected = hmac.new(
            self.webhook_secret.encode(),
            msg=raw_body,
            digestmod=hashlib.sha256
        ).hexdigest()

        # Signature might be hex or prefixed; allow direct match.
        provided = signature_header.strip().lower()
        return hmac.compare_digest(expected, provided)
    
    async def send_message(self, user_id: str, message: str) -> bool:
        """
        Send message to TikTok user.
        NOTE: TikTok does NOT have a public DM API as of 2026.
        This is a placeholder — will need updating once/if TikTok
        opens a messaging endpoint for developers.
        """
        try:
            response = await self.client.post(
                "/v2/im/message/send/",
                headers={"Authorization": f"Bearer {self.access_token}"},
                json={
                    "to_user_id": user_id,
                    "content": {"text": message}
                }
            )
            
            if response.status_code == 200:
                print(f"✅ TT message sent to {user_id}")
                return True
            else:
                print(f"❌ TT send failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ TT send error: {e}")
            return False
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
