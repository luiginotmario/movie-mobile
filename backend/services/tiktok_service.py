"""
TikTok Business Messaging API Service
Docs: https://business-api.tiktok.com/portal/docs?id=1832184403754242

Endpoints:
  Send message:    POST /open_api/v1.3/business/message/send/
  Download media:  POST /open_api/v1.3/business/message/media/download/
  Webhook sub:     POST /open_api/v1.3/business/webhook/update/

Auth: Access-Token header with short-lived token per authorized business.
Webhook auth: app_id + secret (no per-business token needed).
"""

import httpx
import hmac
import hashlib
import json
import tempfile
import os
from typing import Optional
from config import settings


class TikTokService:
    BASE_URL = "https://business-api.tiktok.com/open_api/v1.3"

    def __init__(self):
        self.access_token = settings.TIKTOK_ACCESS_TOKEN
        self.app_id = settings.TIKTOK_APP_ID
        self.app_secret = settings.TIKTOK_APP_SECRET
        self.webhook_secret = settings.TIKTOK_WEBHOOK_SECRET
        self.signature_header = settings.TIKTOK_WEBHOOK_SIGNATURE_HEADER

        self.client = httpx.AsyncClient(
            base_url=self.BASE_URL,
            timeout=settings.REQUEST_TIMEOUT
        )

    def _headers(self, access_token: Optional[str] = None) -> dict:
        return {
            "Content-Type": "application/json",
            "Access-Token": access_token or self.access_token,
        }

    # ------------------------------------------------------------------
    # Webhook signature verification
    # ------------------------------------------------------------------

    def verify_signature(self, raw_body: bytes, signature_header: Optional[str]) -> bool:
        if not self.webhook_secret:
            return True
        if not signature_header:
            return False

        expected = hmac.new(
            self.webhook_secret.encode(),
            msg=raw_body,
            digestmod=hashlib.sha256
        ).hexdigest()

        provided = signature_header.strip().lower()
        return hmac.compare_digest(expected, provided)

    # ------------------------------------------------------------------
    # Send a text message
    # ------------------------------------------------------------------

    async def send_message(
        self,
        business_id: str,
        conversation_id: str,
        text: str,
        access_token: Optional[str] = None,
    ) -> bool:
        """
        POST /open_api/v1.3/business/message/send/

        Sends a text message in a conversation.
        48-hour window, max 10 consecutive messages, max 6000 chars.
        """
        try:
            response = await self.client.post(
                "/business/message/send/",
                headers=self._headers(access_token),
                json={
                    "business_id": business_id,
                    "conversation_id": conversation_id,
                    "content": json.dumps({
                        "text": {"body": text[:6000]}
                    }),
                }
            )

            data = response.json()
            if data.get("code") == 0:
                print(f"✅ TT message sent in conversation {conversation_id}")
                return True
            else:
                print(f"❌ TT send failed: {data}")
                return False

        except Exception as e:
            print(f"❌ TT send error: {e}")
            return False

    # ------------------------------------------------------------------
    # Download media (video/image) by media_id
    # ------------------------------------------------------------------

    async def download_media(
        self,
        business_id: str,
        media_id: str,
        access_token: Optional[str] = None,
    ) -> Optional[str]:
        """
        POST /open_api/v1.3/business/message/media/download/

        Downloads a video/image from a received message.
        Returns a local temp file path, or None on failure.
        """
        try:
            response = await self.client.post(
                "/business/message/media/download/",
                headers=self._headers(access_token),
                json={
                    "business_id": business_id,
                    "media_id": media_id,
                }
            )

            if response.status_code != 200:
                print(f"❌ TT media download failed: {response.status_code} - {response.text}")
                return None

            content_type = response.headers.get("content-type", "")

            if "json" in content_type:
                data = response.json()
                url = data.get("data", {}).get("url")
                if url:
                    return url
                print(f"❌ TT media download: no URL in response: {data}")
                return None

            ext = ".mp4" if "video" in content_type else ".jpg"
            tmp = tempfile.NamedTemporaryFile(
                dir=settings.TEMP_DIR, suffix=ext, delete=False
            )
            tmp.write(response.content)
            tmp.close()
            return tmp.name

        except Exception as e:
            print(f"❌ TT media download error: {e}")
            return None

    # ------------------------------------------------------------------
    # Subscribe webhook (one-time setup call)
    # ------------------------------------------------------------------

    async def subscribe_webhook(self, callback_url: str) -> bool:
        """
        POST /open_api/v1.3/business/webhook/update/
        Uses app_id + secret (not access token).
        """
        try:
            response = await self.client.post(
                "/business/webhook/update/",
                json={
                    "app_id": self.app_id,
                    "secret": self.app_secret,
                    "event_type": "DIRECT_MESSAGE",
                    "callback_url": callback_url,
                }
            )
            data = response.json()
            if data.get("code") == 0:
                print(f"✅ TT webhook subscribed: {callback_url}")
                return True
            else:
                print(f"❌ TT webhook subscribe failed: {data}")
                return False
        except Exception as e:
            print(f"❌ TT webhook subscribe error: {e}")
            return False

    # ------------------------------------------------------------------
    # Parse incoming webhook payload
    # ------------------------------------------------------------------

    @staticmethod
    def parse_webhook(data: dict) -> list[dict]:
        """
        Parse a TikTok BM webhook payload into a list of message dicts.
        Returns: [{type, business_id, conversation_id, sender_id, text?, media_id?}]
        """
        event = data.get("event", "")
        if event not in ("im_receive_msg", "im_receive_msg_eu"):
            return []

        business_id = data.get("user_openid", "")
        content_str = data.get("content", "")
        try:
            content = json.loads(content_str) if isinstance(content_str, str) else content_str
        except json.JSONDecodeError:
            return []

        conversation_id = content.get("conversation_id", "")
        sender_id = content.get("from_user", {}).get("id", "")
        msg_type = content.get("type", "")

        result = {
            "business_id": business_id,
            "conversation_id": conversation_id,
            "sender_id": sender_id,
        }

        if msg_type == "text":
            body = content.get("text", {}).get("body", "").strip()
            if body:
                return [{**result, "type": "text", "text": body}]

        elif msg_type == "video":
            media_id = content.get("video", {}).get("media_id", "")
            if media_id:
                return [{**result, "type": "video", "media_id": media_id}]

        elif msg_type == "image":
            media_id = content.get("image", {}).get("media_id", "")
            if media_id:
                return [{**result, "type": "image", "media_id": media_id}]

        elif msg_type == "share_post":
            return [{**result, "type": "text", "text": "[shared a TikTok post]"}]

        return []

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
