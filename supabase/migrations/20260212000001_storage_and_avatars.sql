-- ═══════════════════════════════════════════════════
-- MIGRATION: Storage Buckets & Avatar Sync
-- Date: 2026-02-12
-- ═══════════════════════════════════════════════════

-- 1. Upgrade handle_new_user to capture OAuth avatars
create or replace function public.handle_new_user()
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

-- 2. Initialize Buckets
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('products', 'products', true),
  ('vendors', 'vendors', true)
on conflict (id) do nothing;

-- 3. Storage Security (RLS)
-- Avatars
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Users can upload their own avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

create policy "Users can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text );

-- Products
create policy "Product images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'products' );

create policy "Vendors can upload product images."
  on storage.objects for insert
  with check ( bucket_id = 'products' );

-- Vendors
create policy "Vendor assets are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'vendors' );

create policy "Vendors can upload their own assets."
  on storage.objects for insert
  with check ( bucket_id = 'vendors' );
