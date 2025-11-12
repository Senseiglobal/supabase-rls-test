-- Migration: Add Inbox Highlights Table
-- Created: 2025-11-12
-- Description: Creates table for storing AI-generated inbox highlights

-- Create inbox_highlights table
create table if not exists public.inbox_highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject text,
  sender text,
  summary text,
  booking_related boolean default false,
  received_at timestamptz,
  read boolean default false,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.inbox_highlights enable row level security;

-- Create RLS policies for inbox_highlights
create policy "Users can view own inbox highlights"
  on public.inbox_highlights for select
  using (auth.uid() = user_id);

create policy "Users can insert own inbox highlights"
  on public.inbox_highlights for insert
  with check (auth.uid() = user_id);

create policy "Users can update own inbox highlights"
  on public.inbox_highlights for update
  using (auth.uid() = user_id);

create policy "Users can delete own inbox highlights"
  on public.inbox_highlights for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists inbox_highlights_user_id_idx on public.inbox_highlights(user_id);
create index if not exists inbox_highlights_booking_related_idx on public.inbox_highlights(booking_related);
create index if not exists inbox_highlights_received_at_idx on public.inbox_highlights(received_at);
create index if not exists inbox_highlights_read_idx on public.inbox_highlights(read);
