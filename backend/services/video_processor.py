"""
Video Processor Service
Downloads videos and extracts key frames for VLM analysis
"""

import httpx
import cv2
import numpy as np
from pathlib import Path
from typing import List, Optional
import tempfile
import os
from config import settings

class VideoProcessor:
    def __init__(self):
        self.temp_dir = Path(settings.TEMP_DIR)
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        self.max_size_mb = settings.MAX_VIDEO_SIZE_MB
        
    async def download_video(self, video_url: str) -> Optional[str]:
        """
        Download video from URL to temporary file
        
        Args:
            video_url: URL of the video
            
        Returns:
            Path to downloaded video file
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    video_url,
                    follow_redirects=True,
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    print(f"Failed to download video: {response.status_code}")
                    return None
                
                # Check file size
                content_length = int(response.headers.get("content-length", 0))
                if content_length > self.max_size_mb * 1024 * 1024:
                    print(f"Video too large: {content_length / 1024 / 1024:.2f}MB")
                    return None
                
                # Save to temp file
                temp_file = tempfile.NamedTemporaryFile(
                    delete=False,
                    suffix=".mp4",
                    dir=self.temp_dir
                )
                temp_file.write(response.content)
                temp_file.close()
                
                return temp_file.name
                
        except Exception as e:
            print(f"Error downloading video: {e}")
            return None
    
    def extract_frames_from_file(self, video_path: str, num_frames: int = 3) -> List[bytes]:
        """
        Extract evenly spaced frames from video file
        
        Args:
            video_path: Path to video file
            num_frames: Number of frames to extract
            
        Returns:
            List of frames as JPEG bytes
        """
        frames = []
        
        try:
            cap = cv2.VideoCapture(video_path)
            
            if not cap.isOpened():
                print(f"Failed to open video: {video_path}")
                return frames
            
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            if total_frames == 0:
                print("Video has no frames")
                return frames
            
            # Calculate frame positions (evenly spaced, avoiding first and last 10%)
            start_frame = int(total_frames * 0.1)
            end_frame = int(total_frames * 0.9)
            frame_positions = np.linspace(start_frame, end_frame, num_frames, dtype=int)
            
            for frame_pos in frame_positions:
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_pos)
                ret, frame = cap.read()
                
                if ret:
                    # Resize frame to reasonable size for VLM
                    height, width = frame.shape[:2]
                    max_dimension = 1024
                    
                    if max(height, width) > max_dimension:
                        scale = max_dimension / max(height, width)
                        new_width = int(width * scale)
                        new_height = int(height * scale)
                        frame = cv2.resize(frame, (new_width, new_height))
                    
                    # Encode as JPEG
                    success, buffer = cv2.imencode(
                        '.jpg',
                        frame,
                        [cv2.IMWRITE_JPEG_QUALITY, settings.FRAME_QUALITY]
                    )
                    
                    if success:
                        frames.append(buffer.tobytes())
            
            cap.release()
            
            print(f"Extracted {len(frames)} frames from video")
            return frames
            
        except Exception as e:
            print(f"Error extracting frames: {e}")
            return frames
    
    async def extract_key_frames(self, video_url: str, num_frames: int = 3) -> List[bytes]:
        """
        Full pipeline: Download video and extract frames
        
        Args:
            video_url: URL of the video
            num_frames: Number of frames to extract
            
        Returns:
            List of frames as JPEG bytes
        """
        video_path = await self.download_video(video_url)
        
        if not video_path:
            return []
        
        try:
            frames = self.extract_frames_from_file(video_path, num_frames)
            return frames
        finally:
            # Clean up temp file
            if video_path and os.path.exists(video_path):
                try:
                    os.remove(video_path)
                except:
                    pass
    
    def cleanup_old_files(self, max_age_hours: int = 24):
        """Remove temp files older than max_age_hours"""
        import time
        
        now = time.time()
        cutoff = now - (max_age_hours * 3600)
        
        for file_path in self.temp_dir.glob("*"):
            if file_path.is_file():
                if file_path.stat().st_mtime < cutoff:
                    try:
                        file_path.unlink()
                    except:
                        pass
