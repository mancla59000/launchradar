-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-- Create schemas
CREATE SCHEMA IF NOT EXISTS raw_data;

-- Personal user profile
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users NOT NULL,
    email TEXT NOT NULL,
    preferences JSONB DEFAULT '{}', -- Personal filtering preferences
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Raw social media posts collection
CREATE TABLE raw_data.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL CHECK (source IN ('twitter', 'reddit')),
    external_id TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    engagement_metrics JSONB NOT NULL,
    raw_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    UNIQUE(source, external_id)
);

-- Processed opportunities for personal dashboard
CREATE TABLE public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    source TEXT NOT NULL,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    category TEXT NOT NULL,
    personal_tags TEXT[] DEFAULT '{}', -- Personal categorization
    engagement_data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    discovered_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal research notes
CREATE TABLE public.research_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    opportunity_id UUID REFERENCES public.opportunities(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_data.posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for personal use
CREATE POLICY "Users access own data" ON public.profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users access own notes" ON public.research_notes
    FOR ALL USING (user_id = auth.uid());

-- Opportunities visible to authenticated users (personal use)
CREATE POLICY "Authenticated users see opportunities" ON public.opportunities
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert opportunities" ON public.opportunities
    FOR INSERT WITH CHECK (true);

-- Raw data accessible by service role only
CREATE POLICY "Service role access raw data" ON raw_data.posts
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_notes_updated_at BEFORE UPDATE ON public.research_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_opportunities_score ON public.opportunities(score DESC);
CREATE INDEX idx_opportunities_created_at ON public.opportunities(created_at DESC);
CREATE INDEX idx_opportunities_category ON public.opportunities(category);
CREATE INDEX idx_research_notes_user_id ON public.research_notes(user_id);
CREATE INDEX idx_posts_source_created ON raw_data.posts(source, created_at DESC);
CREATE INDEX idx_posts_processed ON raw_data.posts(processed_at) WHERE processed_at IS NULL;