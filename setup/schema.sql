-- Soulseek accounts: multiple per user
CREATE TABLE soulseek_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, username)
);
ALTER TABLE soulseek_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own accounts" ON soulseek_accounts
  FOR ALL USING (auth.uid() = user_id);

-- Spotify connections: per user
CREATE TABLE spotify_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  spotify_user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE spotify_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own spotify" ON spotify_connections
  FOR ALL USING (auth.uid() = user_id);

-- Download jobs: central history
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  soulseek_account_id UUID REFERENCES soulseek_accounts(id) ON DELETE SET NULL,
  input TEXT NOT NULL,
  input_type TEXT NOT NULL,
  download_mode TEXT NOT NULL,
  flags JSONB NOT NULL DEFAULT '{}',
  state TEXT NOT NULL DEFAULT 'queued',
  progress JSONB NOT NULL DEFAULT '{"total":0,"completed":0,"failed":0,"skipped":0}',
  output JSONB NOT NULL DEFAULT '[]',
  parent_job_id UUID REFERENCES jobs(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own jobs" ON jobs
  FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_state ON jobs(state);

-- User settings/preferences
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);
