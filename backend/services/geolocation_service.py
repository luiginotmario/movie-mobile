"""
Geolocation Service
Convert IP addresses to country codes for region-specific content
"""

import httpx
from typing import Optional
from fastapi import Request

class GeolocationService:
    """
    Get user's country from IP address without requiring permissions
    Uses free IP geolocation APIs
    """
    
    @staticmethod
    async def get_country_from_request(request: Request) -> str:
        """
        Get country code from request IP address
        
        Args:
            request: FastAPI request object
            
        Returns:
            Two-letter country code (e.g., "US", "GB") or "US" as fallback
        """
        client_ip = request.client.host if request.client else None
        
        if not client_ip:
            return "US"
        
        return await GeolocationService.get_country_from_ip(client_ip)
    
    @staticmethod
    async def get_country_from_ip(ip_address: str) -> str:
        """
        Convert IP address to country code
        
        Args:
            ip_address: IP address string
            
        Returns:
            Two-letter country code or "US" as fallback
        """
        # Skip localhost/private IPs
        if ip_address in ["127.0.0.1", "::1", "localhost"] or ip_address.startswith("192.168."):
            return "US"
        
        # Try ipapi.co first (30K requests/month free, no key needed)
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://ipapi.co/{ip_address}/country/",
                    timeout=2.0
                )
                
                if response.status_code == 200:
                    country = response.text.strip()
                    # Validate country code (should be 2 letters)
                    if len(country) == 2 and country.isalpha():
                        print(f"🌍 Detected country: {country} (from IP: {ip_address})")
                        return country.upper()
        
        except Exception as e:
            print(f"⚠️  Geolocation error: {e}")
        
        # Fallback to US
        print(f"🌍 Using fallback country: US")
        return "US"
    
    @staticmethod
    async def get_country_with_app_hint(
        request: Request,
        app_country: Optional[str] = None
    ) -> str:
        """
        Get country code with optional hint from iOS app
        
        Args:
            request: FastAPI request object
            app_country: Optional country from iOS App Store locale
            
        Returns:
            Country code (prioritizes app hint over IP geolocation)
        """
        # Priority 1: App-provided country (from iOS locale)
        if app_country and len(app_country) == 2:
            print(f"🌍 Using app-provided country: {app_country}")
            return app_country.upper()
        
        # Priority 2: IP geolocation
        return await GeolocationService.get_country_from_request(request)
