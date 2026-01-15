-- Create Profiles table (extends auth.users)
create type user_role as enum ('admin', 'inspector', 'viewer');

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role user_role default 'inspector',
  full_name text,
  avatar_url text,
  updated_at timestamptz
);

-- Routes
create table public.routes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  created_by uuid references public.profiles(id)
);

-- Checkpoints
create table public.checkpoints (
  id uuid default gen_random_uuid() primary key,
  route_id uuid references public.routes(id) on delete cascade not null,
  name text not null,
  sequence_order integer not null,
  latitude double precision not null,
  longitude double precision not null,
  radius_meters integer default 20,
  qr_code_value text not null
);

-- Inspections
create type inspection_status as enum ('completed', 'flagged', 'skipped');

create table public.inspections (
  id uuid default gen_random_uuid() primary key,
  checkpoint_id uuid references public.checkpoints(id) not null,
  inspector_id uuid references public.profiles(id) not null,
  status inspection_status default 'completed',
  recorded_at timestamptz default now(),
  gps_lat double precision,
  gps_lng double precision,
  data jsonb, -- Stores checklist answers { "field_id": "value" }
  CHECK (status IN ('completed', 'flagged', 'skipped'))
);

create table public.inspection_photos (
  id uuid default gen_random_uuid() primary key,
  inspection_id uuid references public.inspections(id) on delete cascade not null,
  storage_path text not null,
  caption text,
  created_at timestamptz default now()
);

-- RLS Policies (Basic Setup)
alter table public.profiles enable row level security;
alter table public.routes enable row level security;
alter table public.checkpoints enable row level security;
alter table public.inspections enable row level security;
alter table public.inspection_photos enable row level security;

-- Policies
-- 1. Profiles: Users can read all profiles, but only update their own.
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 2. Routes/Checkpoints: Functionally public read for inspectors. Admin write.
create policy "Routes are viewable by authenticated users" on public.routes for select using (auth.role() = 'authenticated');
create policy "Checkpoints are viewable by authenticated users" on public.checkpoints for select using (auth.role() = 'authenticated');

-- 3. Inspections: Inspectors can insert. Everyone can read (for now).
create policy "Inspectors can insert inspections" on public.inspections for insert with check (auth.uid() = inspector_id);
create policy "Inspections are viewable by authenticated users" on public.inspections for select using (auth.role() = 'authenticated');

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
