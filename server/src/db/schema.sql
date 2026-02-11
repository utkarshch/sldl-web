-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create soulseek_accounts table
create table if not exists soulseek_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  username text not null,
  password text not null,
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table soulseek_accounts enable row level security;

create policy "Users can view their own accounts"
  on soulseek_accounts for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own accounts"
  on soulseek_accounts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own accounts"
  on soulseek_accounts for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own accounts"
  on soulseek_accounts for delete
  using ( auth.uid() = user_id );

-- Create indexes
create index if not exists soulseek_accounts_user_id_idx on soulseek_accounts(user_id);
create index if not exists soulseek_accounts_is_active_idx on soulseek_accounts(is_active);
