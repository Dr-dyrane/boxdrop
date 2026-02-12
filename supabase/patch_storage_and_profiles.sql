-- ═══════════════════════════════════════════════════
-- BOXDROP DATABASE PATCH (Avatars & Storage)
-- Run this in your Supabase SQL Editor to fix existing data.
-- ═══════════════════════════════════════════════════

-- 1. Update the Trigger Function to capture avatars in the future
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      ''
    )
  )
  on conflict (id) do update set
    avatar_url = coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      public.profiles.avatar_url
    );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Backfill existing profile avatars from auth.users
update public.profiles
set avatar_url = coalesce(
  u.raw_user_meta_data->>'avatar_url',
  u.raw_user_meta_data->>'picture'
)
from auth.users u
where u.id = public.profiles.id
and (public.profiles.avatar_url is null or public.profiles.avatar_url = '');

-- 3. Initialize Storage Buckets
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('products', 'products', true),
  ('vendors', 'vendors', true)
on conflict (id) do nothing;

-- 4. Set up Storage RLS
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Users can upload their own avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

create policy "Users can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

create policy "Product images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'products' );

create policy "Vendors can upload product images."
  on storage.objects for insert
  with check ( bucket_id = 'products' );

create policy "Vendor assets are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'vendors' );

create policy "Vendors can upload their own assets."
  on storage.objects for insert
  with check ( bucket_id = 'vendors' );
