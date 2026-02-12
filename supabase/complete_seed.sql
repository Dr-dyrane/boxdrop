
-- ═══════════════════════════════════════════════════
-- BOXDROP COMPLETE MARKETPLACE SEED (v3.0)
-- ═══════════════════════════════════════════════════

-- 1. EXTENDED VENDORS
insert into vendors (id, name, description, address, location, rating, is_featured, cover_url, logo_url, category) values
  ('a1000000-0000-0000-0000-000000000010', 'The Tech Haven', 'Next-gen gadgets and electronics delivered in minutes.', 'W Florida Ave, Hemet, CA', st_point(-116.9710, 33.7470)::geography, 4.9, true, 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1200', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=200', 'Retail'),
  ('a1000000-0000-0000-0000-000000000011', 'Hemet Florals', 'Bespoke bouquets and artisanal plants for every occasion.', 'N Sanderson Ave, Hemet, CA', st_point(-116.9940, 33.7430)::geography, 4.8, false, 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1200', 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=200', 'Beauty'),
  ('a1000000-0000-0000-0000-000000000012', 'Prime Auto Parts', 'Oem and premium aftermarket parts for your machine.', 'E Stetson Ave, Hemet, CA', st_point(-116.9540, 33.7540)::geography, 4.7, false, 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=1200', 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=200', 'Retail'),
  ('a1000000-0000-0000-0000-000000000013', 'Sushi Zen Hemet', 'Precision-cut sashimi and premium roles delivered fresh.', 'S State St, Hemet, CA', st_point(-117.0110, 33.7670)::geography, 4.9, true, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1200', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=200', 'Restaurant');

-- 2. EXTENDED PRODUCTS
insert into products (vendor_id, name, description, price, stock, category, image_url) values
  -- Tech Haven
  ('a1000000-0000-0000-0000-000000000010', 'Neural Buds Pro', 'Active noise cancellation with 48h spatial audio.', 199.00, 15, 'Audio', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000010', 'Smart Frame V2', '4K E-ink display for digital art curation.', 249.00, 8, 'Smart Home', 'https://images.unsplash.com/photo-1544244015-0cd4b3fe809e?q=80&w=400'),
  -- Sushi Zen
  ('a1000000-0000-0000-0000-000000000013', 'Omakase Box', 'Chef curated selection of the days best cuts.', 45.00, 10, 'Sets', 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000013', 'Dragon Roll', 'Tempura shrimp, eel, avocado, and unagi glaze.', 18.00, 25, 'Rolls', 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=400');
