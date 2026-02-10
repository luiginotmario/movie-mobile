# MovieLibrary Backend

FastAPI backend for movie identification from Instagram/TikTok video clips using Vision Language Models (VLM).

## Features

- 🎥 **Video Processing**: Extract key frames from videos
- 🤖 **VLM Integration**: Identify movies using OpenRouter (Gemini Flash, GPT-4o, Claude)
- 🎬 **TMDB Verification**: Confirm and enrich movie data
- 📱 **Webhook Support**: Instagram & TikTok integration
- ⚡ **Fast Response**: 5-10 second total processing time

## Architecture

```
Video URL → Download → Extract Frames → VLM Identification → TMDB Verification → Response
            1-2s       0.5s             2-3s               1s                  ~6s total
```

## Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp env.example .env
# Edit .env with your API keys
```

Required API keys:
- **OpenRouter**: Get from [openrouter.ai](https://openrouter.ai)
- **TMDB**: Get from [themoviedb.org](https://www.themoviedb.org/settings/api)
- **Instagram**: Set up at [developers.facebook.com](https://developers.facebook.com)
- **TikTok**: Apply at [developers.tiktok.com](https://developers.tiktok.com)

### 3. Run Development Server

```bash
python main.py
# Or using uvicorn directly:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at: `http://localhost:8000`

## API Endpoints

### Health Check
```bash
GET /
GET /health
```

### Instagram Webhook
```bash
GET  /webhook/instagram  # Verification
POST /webhook/instagram  # Receive messages
```

### TikTok Webhook
```bash
POST /webhook/tiktok
```

### Direct API (Testing)
```bash
POST /api/identify-movie
{
  "video_url": "https://example.com/video.mp4"
}
```

## Testing

### Test with cURL

```bash
# Health check
curl http://localhost:8000/health

# Identify movie from video
curl -X POST http://localhost:8000/api/identify-movie \
  -H "Content-Type: application/json" \
  -d '{"video_url": "https://example.com/video.mp4"}'
```

### Test with Python

```python
import httpx

async def test_identify():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/api/identify-movie",
            json={"video_url": "https://example.com/video.mp4"}
        )
        print(response.json())
```

## Project Structure

```
backend/
├── main.py                    # FastAPI app entry point
├── config.py                  # Configuration and settings
├── requirements.txt           # Python dependencies
├── env.example                # Environment variables template
└── services/
    ├── video_processor.py     # Video download and frame extraction
    ├── openrouter_service.py  # VLM integration
    ├── tmdb_service.py        # TMDB API integration
    ├── instagram_service.py   # Instagram API
    └── tiktok_service.py      # TikTok API
```

## VLM Models

Available through OpenRouter:

| Model | Speed | Cost | Best For |
|-------|-------|------|----------|
| `google/gemini-flash-1.5-8b` | 1-2s | $0.001/req | Production (recommended) |
| `openai/gpt-4o-mini` | 2-3s | $0.005/req | High accuracy |
| `anthropic/claude-3-haiku` | 2-3s | $0.008/req | Complex scenes |

## Deployment

### Railway

```bash
railway login
railway init
railway up
```

### Fly.io

```bash
fly auth login
fly launch
fly deploy
```

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t movielibrary-backend .
docker run -p 8000:8000 --env-file .env movielibrary-backend
```

## Instagram Webhook Setup

1. Create Facebook App at [developers.facebook.com](https://developers.facebook.com)
2. Add Instagram product
3. Configure webhook:
   - Callback URL: `https://your-domain.com/webhook/instagram`
   - Verify Token: Your chosen token (set in .env)
4. Subscribe to `messages` webhook field

## TikTok Webhook Setup

1. Apply for TikTok Developer account
2. Create app and get API credentials
3. Configure webhook endpoint
4. Follow TikTok's specific webhook requirements

## Performance Optimization

- Use **Gemini Flash** for best speed/cost ratio
- Extract **2-3 frames** (more doesn't help much)
- Cache common movie results
- Use background tasks for processing
- Clean up temp files regularly

## Troubleshooting

### Video download fails
- Check video URL is publicly accessible
- Verify file size < 50MB
- Check network connectivity

### VLM identification fails
- Try different model (fallback mechanism)
- Increase number of frames
- Ensure frames are clear and well-lit

### TMDB verification fails
- Verify API key is correct
- Check movie exists in TMDB database
- Try with year parameter

## Cost Estimation

Per 1000 requests:
- **Gemini Flash**: $1
- **GPT-4o Mini**: $5
- **Bandwidth**: ~$0.50 (varies)
- **Total**: ~$1.50/1000 requests

## License

All rights reserved. Private project.
