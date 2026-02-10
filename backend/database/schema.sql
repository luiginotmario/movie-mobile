-- MovieLibrary Social Media Integration Schema
-- Add these tables to your Supabase database

-- ============================================================================
-- Social Media Users Tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_media_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Platform identification
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
    platform_user_id TEXT NOT NULL,
    platform_username TEXT,
    
    -- Interaction tracking
    first_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_messages INTEGER DEFAULT 1,
    
    -- Account linking
    is_linked BOOLEAN DEFAULT FALSE,
    app_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    linked_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(platform, platform_user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_users_platform_id 
    ON social_media_users(platform, platform_user_id);
CREATE INDEX IF NOT EXISTS idx_social_users_app_user 
    ON social_media_users(app_user_id);
CREATE INDEX IF NOT EXISTS idx_social_users_linked 
    ON social_media_users(is_linked);

-- ============================================================================
-- One-Time Link Tokens
-- ============================================================================
CREATE TABLE IF NOT EXISTS link_tokens (
    token TEXT PRIMARY KEY,
    
    -- Platform info
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
    platform_user_id TEXT NOT NULL,
    
    -- Token lifecycle
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_link_tokens_platform_user 
    ON link_tokens(platform_user_id);
CREATE INDEX IF NOT EXISTS idx_link_tokens_expires 
    ON link_tokens(expires_at);

-- ============================================================================
-- Movie Clips Storage
-- ============================================================================
CREATE TABLE IF NOT EXISTS movie_clips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User and movie references
    app_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id TEXT NOT NULL, -- TMDB ID
    
    -- Platform info
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
    platform_user_id TEXT,
    
    -- Video URLs
    original_video_url TEXT,
    stored_video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    
    -- Metadata
    duration_seconds INTEGER,
    file_size_bytes INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clips_user ON movie_clips(app_user_id);
CREATE INDEX IF NOT EXISTS idx_clips_movie ON movie_clips(movie_id);
CREATE INDEX IF NOT EXISTS idx_clips_platform ON movie_clips(platform);
CREATE INDEX IF NOT EXISTS idx_clips_created ON movie_clips(created_at DESC);

-- ============================================================================
-- Triggers for auto-updating timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_social_media_users_updated_at
    BEFORE UPDATE ON social_media_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Social Media Users (admin only for now)
ALTER TABLE social_media_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage social media users"
    ON social_media_users
    FOR ALL
    USING (auth.role() = 'service_role');

-- Link Tokens (service role only)
ALTER TABLE link_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage link tokens"
    ON link_tokens
    FOR ALL
    USING (auth.role() = 'service_role');

-- Movie Clips (users can view their own)
ALTER TABLE movie_clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clips"
    ON movie_clips FOR SELECT
    USING (auth.uid() = app_user_id);

CREATE POLICY "Service role can insert clips"
    ON movie_clips FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can delete own clips"
    ON movie_clips FOR DELETE
    USING (auth.uid() = app_user_id);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Clean up expired tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM link_tokens
    WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Get user stats
CREATE OR REPLACE FUNCTION get_user_clip_stats(user_uuid UUID)
RETURNS TABLE (
    total_clips INTEGER,
    total_movies INTEGER,
    total_size_mb NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_clips,
        COUNT(DISTINCT movie_id)::INTEGER as total_movies,
        ROUND(SUM(file_size_bytes)::NUMERIC / 1024 / 1024, 2) as total_size_mb
    FROM movie_clips
    WHERE app_user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Storage Bucket Setup (run in Supabase Storage)
-- ============================================================================

-- Create storage bucket for movie clips
-- Run this in Supabase dashboard Storage section or via SQL:
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('movie-clips', 'movie-clips', true);

-- Set up storage policies
CREATE POLICY "Users can upload own clips"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'movie-clips' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view clips"
ON storage.objects FOR SELECT
USING (bucket_id = 'movie-clips');

CREATE POLICY "Users can delete own clips"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'movie-clips' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
*/
