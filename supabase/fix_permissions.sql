-- FIX: Add missing RLS policies for Routes and Checkpoints
-- Run this in your Supabase Dashboard > SQL Editor

-- 1. Routes: Allow authenticated users to Create, Update, and Delete
create policy "Enable insert for authenticated users" on public.routes for insert 
with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users" on public.routes for update 
using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users" on public.routes for delete 
using (auth.role() = 'authenticated');

-- 2. Checkpoints: Allow authenticated users to Manage Checkpoints
create policy "Enable insert for authenticated users" on public.checkpoints for insert 
with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users" on public.checkpoints for update 
using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users" on public.checkpoints for delete 
using (auth.role() = 'authenticated');
