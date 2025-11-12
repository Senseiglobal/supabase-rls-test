-- Migration: Add AuraManager Feature Tables
-- Created: 2025-11-10
-- Description: Creates tables for tasks, ai_feedback, permissions, and feature_flags

-- Create tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  due_date timestamptz,
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create ai_feedback table
create table if not exists public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  feature text not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now() not null
);

-- Create permissions table
create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  permission_type text not null,
  granted boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, permission_type)
);

-- Create feature_flags table
create table if not exists public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  flag_name text not null,
  enabled boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, flag_name)
);

-- Create team_members table
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_owner_id uuid references auth.users(id) on delete cascade not null,
  member_id uuid references auth.users(id) on delete cascade,
  email text,
  role text default 'viewer' check (role in ('owner', 'editor', 'viewer')) not null,
  invite_token text unique,
  invite_expires_at timestamptz,
  status text default 'pending' check (status in ('pending', 'active', 'revoked')) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Extend profiles table (add columns if not exists)
alter table public.profiles 
add column if not exists archetype text,
add column if not exists first_name text,
add column if not exists ai_preferences jsonb default '{}'::jsonb,
add column if not exists inbox_sync_enabled boolean default false,
add column if not exists calendar_sync_enabled boolean default false;

-- Enable RLS
alter table public.tasks enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.permissions enable row level security;
alter table public.feature_flags enable row level security;
alter table public.team_members enable row level security;

-- Create RLS policies for tasks
create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Create RLS policies for ai_feedback
create policy "Users can view own feedback"
  on public.ai_feedback for select
  using (auth.uid() = user_id);

create policy "Users can insert own feedback"
  on public.ai_feedback for insert
  with check (auth.uid() = user_id);

-- Create RLS policies for permissions
create policy "Users can view own permissions"
  on public.permissions for select
  using (auth.uid() = user_id);

create policy "Users can insert own permissions"
  on public.permissions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own permissions"
  on public.permissions for update
  using (auth.uid() = user_id);

-- Create RLS policies for feature_flags
create policy "Users can view own feature flags"
  on public.feature_flags for select
  using (auth.uid() = user_id);

create policy "Users can insert own feature flags"
  on public.feature_flags for insert
  with check (auth.uid() = user_id);

create policy "Users can update own feature flags"
  on public.feature_flags for update
  using (auth.uid() = user_id);

-- Create RLS policies for team_members
create policy "Team owners can view their team"
  on public.team_members for select
  using (auth.uid() = team_owner_id or auth.uid() = member_id);

create policy "Team owners can insert members"
  on public.team_members for insert
  with check (auth.uid() = team_owner_id);

create policy "Team owners can update members"
  on public.team_members for update
  using (auth.uid() = team_owner_id);

create policy "Team owners can delete members"
  on public.team_members for delete
  using (auth.uid() = team_owner_id);

-- Create indexes for better performance
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists ai_feedback_user_id_idx on public.ai_feedback(user_id);
create index if not exists permissions_user_id_idx on public.permissions(user_id);
create index if not exists feature_flags_user_id_idx on public.feature_flags(user_id);
create index if not exists team_members_owner_id_idx on public.team_members(team_owner_id);
create index if not exists team_members_member_id_idx on public.team_members(member_id);
create index if not exists team_members_invite_token_idx on public.team_members(invite_token);

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_tasks_updated_at before update on public.tasks
  for each row execute function public.update_updated_at_column();

create trigger update_permissions_updated_at before update on public.permissions
  for each row execute function public.update_updated_at_column();

create trigger update_feature_flags_updated_at before update on public.feature_flags
  for each row execute function public.update_updated_at_column();

create trigger update_team_members_updated_at before update on public.team_members
  for each row execute function public.update_updated_at_column();
