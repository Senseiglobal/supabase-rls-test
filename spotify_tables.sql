-- Spotify integration tables
-- Profiles table stores cached public artist/user data fetched via Spotify API.
-- RLS enforces access only for owning user.

create table if not exists public.spotify_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  spotify_id text,
  followers integer,
  image_url text,
  country text,
  product text,
  last_refreshed timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.spotify_recent_plays (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  track_id text not null,
  track_name text,
  artist_name text,
  album_name text,
  played_at timestamptz not null,
  duration_ms integer,
  preview_url text,
  inserted_at timestamptz default now()
);

alter table public.spotify_recent_plays
  add constraint recent_plays_user_track_unique unique (user_id, track_id, played_at);

-- RLS
alter table public.spotify_profiles enable row level security;
alter table public.spotify_recent_plays enable row level security;

create policy "spotify_profiles_select_own" on public.spotify_profiles for select using ( auth.uid() = user_id );
create policy "spotify_profiles_upsert_own" on public.spotify_profiles for all using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );

create policy "spotify_recent_plays_select_own" on public.spotify_recent_plays for select using ( auth.uid() = user_id );
create policy "spotify_recent_plays_insert_own" on public.spotify_recent_plays for insert with check ( auth.uid() = user_id );
create policy "spotify_recent_plays_delete_own" on public.spotify_recent_plays for delete using ( auth.uid() = user_id );

-- Helpful indexes
create index if not exists idx_recent_plays_user_played_at on public.spotify_recent_plays(user_id, played_at desc);
create index if not exists idx_recent_plays_user_track on public.spotify_recent_plays(user_id, track_id);
