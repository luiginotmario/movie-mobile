"""
Instagram Service
Handles Instagram Graph API integration
"""

import httpx
import hmac
import hashlib
from typing import Optional
from config import settings

class InstagramService:
    def __init__(self):
        self.access_token = settings.INSTAGRAM_ACCESS_TOKEN
        self.app_secret = settings.INSTAGRAM_APP_SECRET
        self.ig_account_id = settings.INSTAGRAM_ACCOUNT_ID
        self.base_url = "https://graph.instagram.com/v25.0"
        
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={"Authorization": f"Bearer {self.access_token}"},
            timeout=settings.REQUEST_TIMEOUT
        )

    def verify_signature(self, raw_body: bytes, signature_header: Optional[str]) -> bool:
        """
        Verify X-Hub-Signature-256 header from Meta webhooks.
        If no app secret is configured, skip verification.
        """
        if not self.app_secret:
            return True
        if not signature_header:
            return False

        try:
            algo, provided_sig = signature_header.split("=", 1)
            algo = algo.strip().lower()
        except ValueError:
            return False

        if algo not in ("sha256", "sha1"):
            return False

        digestmod = hashlib.sha256 if algo == "sha256" else hashlib.sha1
        expected_sig = hmac.new(
            self.app_secret.encode(),
            msg=raw_body,
            digestmod=digestmod
        ).hexdigest()

        return hmac.compare_digest(expected_sig, provided_sig)
    
    async def send_message(self, recipient_id: str, message: str) -> bool:
        """
        Send a text message to an Instagram user.
        Uses /<IG_ID>/messages with Bearer auth per Meta docs.
        Must respond within 24 hours of the user's message.
        Max 1000 bytes UTF-8.
        """
        try:
            endpoint = f"/{self.ig_account_id}/messages" if self.ig_account_id else "/me/messages"
            response = await self.client.post(
                endpoint,
                json={
                    "recipient": {"id": recipient_id},
                    "message": {"text": message[:1000]}
                }
            )
            
            if response.status_code == 200:
                print(f"✅ IG message sent to {recipient_id}")
                return True
            else:
                print(f"❌ IG send failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ IG send error: {e}")
            return False

    async def send_image(self, recipient_id: str, image_url: str) -> bool:
        """Send an image message to an Instagram user."""
        try:
            endpoint = f"/{self.ig_account_id}/messages" if self.ig_account_id else "/me/messages"
            response = await self.client.post(
                endpoint,
                json={
                    "recipient": {"id": recipient_id},
                    "message": {
                        "attachment": {
                            "type": "image",
                            "payload": {"url": image_url}
                        }
                    }
                }
            )
            return response.status_code == 200
        except Exception as e:
            print(f"❌ IG image send error: {e}")
            return False
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
