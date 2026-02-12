-- ═══════════════════════════════════════════════════
-- BOXDROP SEED DATA (HEMET, US EDITION)
-- Premium Images + Geo-accurate Locations
-- ═══════════════════════════════════════════════════

-- ──────────────────────────────────────────────────
-- VENDORS (5 premium mock vendors in Hemet, CA)
-- ──────────────────────────────────────────────────

insert into vendors (id, name, description, address, location, rating, is_featured, cover_url, logo_url, category) values
  (
    'a1000000-0000-0000-0000-000000000001', 
    'Cloud Kitchen Hemet', 
    'Premium cloud kitchen serving gourmet meals with express delivery in the Valley.', 
    'W Florida Ave, Hemet, CA', 
    st_point(-116.9719, 33.7475)::geography, 
    4.8, 
    true,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=200',
    'Restaurant'
  ),
  (
    'a1000000-0000-0000-0000-000000000002', 
    'Valley Fresh Market', 
    'Farm-to-door grocery delivery. The freshest produce in Hemet.', 
    'N Sanderson Ave, Hemet, CA', 
    st_point(-116.9950, 33.7420)::geography, 
    4.6, 
    true,
    'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200',
    'Groceries'
  ),
  (
    'a1000000-0000-0000-0000-000000000003', 
    'Urban Bites Hemet', 
    'Modern flavors, premium packaging. The best street food experience.', 
    'E Stetson Ave, Hemet, CA', 
    st_point(-116.9530, 33.7550)::geography, 
    4.9, 
    true,
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=200',
    'Restaurant'
  ),
  (
    'a1000000-0000-0000-0000-000000000004', 
    'QuickMart Express', 
    'Hemet corner essentials delivered in 30 minutes or less.', 
    'S State St, Hemet, CA', 
    st_point(-117.0120, 33.7680)::geography, 
    4.5, 
    false,
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1200',
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=200',
    'Retail'
  ),
  (
    'a1000000-0000-0000-0000-000000000005', 
    'The Diamond Grill', 
    'Grilled perfection. Steaks, burgers, and more near the Lake.', 
    'Diamond Valley Rd, Hemet, CA', 
    st_point(-116.9410, 33.7250)::geography, 
    4.7, 
    false,
    'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200',
    'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=200',
    'Restaurant'
  ),
  (
    'a1000000-0000-0000-0000-000000000006', 
    'Valley Wellness Pharmacy', 
    'Prescriptions and wellness essentials delivered with care.', 
    'San Jacinto St, Hemet, CA', 
    st_point(-116.9650, 33.7480)::geography, 
    4.9, 
    false,
    'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=1200',
    'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=200',
    'Pharmacy'
  ),
  (
    'a1000000-0000-0000-0000-000000000007', 
    'Paws & Claws Hemet', 
    'Premium pet food, toys, and grooming gear delivered home.', 
    'W Devonshire Ave, Hemet, CA', 
    st_point(-116.9820, 33.7520)::geography, 
    4.8, 
    false,
    'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=1200',
    'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=200',
    'Pets'
  ),
  (
    'a1000000-0000-0000-0000-000000000008', 
    'The Coffee Beam', 
    'Artisanal roasts and freshly baked pastries delivered to your desk.', 
    'N State St, Hemet, CA', 
    st_point(-116.9720, 33.7490)::geography, 
    4.9, 
    false,
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=200',
    'Coffee'
  ),
  (
    'a1000000-0000-0000-0000-000000000009', 
    'Bloom Beauty Bar', 
    'Luxury skincare and makeup essentials delivered in minutes.', 
    'Menlo Ave, Hemet, CA', 
    st_point(-116.9740, 33.7430)::geography, 
    4.7, 
    false,
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=200',
    'Beauty'
  );

-- ──────────────────────────────────────────────────
-- PRODUCTS (Realistic Images)
-- ──────────────────────────────────────────────────

-- Cloud Kitchen
insert into products (vendor_id, name, description, price, stock, category, image_url) values
  ('a1000000-0000-0000-0000-000000000001', 'Signature Bowl', 'Gourmet jollof rice with slow-roasted chicken.', 12.99, 50, 'Mains', 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000001', 'Spice Soup', 'A warm, rich soup with tender greens and beef.', 8.50, 30, 'Soups', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000001', 'Grilled Fish', 'Whole grilled sea bass with lemon-herb butter.', 24.00, 20, 'Mains', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000001', 'Iced Hibiscus', 'Freshly brewed hibiscus with a hint of ginger.', 4.50, 100, 'Drinks', 'https://images.unsplash.com/photo-1513558116341-75f1d24ae7f5?q=80&w=400');

-- Valley Fresh Market
insert into products (vendor_id, name, description, price, stock, category, image_url) values
  ('a1000000-0000-0000-0000-000000000002', 'Organic Garden Box', 'Curated selection of seasonal CA vegetables.', 29.99, 25, 'Produce', 'https://images.unsplash.com/photo-1566385101042-1a000c1268c4?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000002', 'Exotic Fruit Mix', 'Mango, berries, and stone fruits from local orchards.', 18.00, 40, 'Produce', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000002', 'Farm Eggs (Dozen)', 'Pasture-raised organic eggs.', 7.50, 60, 'Dairy', 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000002', 'Cold-Pressed Green', 'Kale, cucumber, apple, and lemon blend.', 9.00, 35, 'Drinks', 'https://images.unsplash.com/photo-1621506289937-be87d726c27a?q=80&w=400');

-- Urban Bites Hemet
insert into products (vendor_id, name, description, price, stock, category, image_url) values
  ('a1000000-0000-0000-0000-000000000003', 'Spicy Street Taco', 'Hand-pressed corn tortilla with charred beef.', 3.50, 100, 'Street Food', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000003', 'Chicken Pita Wrap', 'Warm pita with roasted chicken and tahini.', 11.00, 50, 'Street Food', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000003', 'Glazed Donut Holes', '12 pieces with caramel drizzle.', 6.50, 60, 'Snacks', 'https://images.unsplash.com/photo-1541535881962-e668f38d4fea?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000003', 'Cold Brew Coffee', 'Nitro cold brew with a splash of oat milk.', 5.50, 80, 'Drinks', 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?q=80&w=400');

-- QuickMart Express
insert into products (vendor_id, name, description, price, stock, category, image_url) values
  ('a1000000-0000-0000-0000-000000000004', 'Daily Essentials', 'Toothpaste, detergent, and hand soap bundle.', 15.00, 30, 'Essentials', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000004', 'Movie Night Pack', 'Popcorn, chocolate, and 2 soda bottles.', 12.00, 40, 'Snacks', 'https://images.unsplash.com/photo-1599490659223-2330b6667554?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000004', 'Spring Water Case', '24 pack of premium California spring water.', 9.50, 100, 'Drinks', 'https://images.unsplash.com/photo-1560341051-764722513460?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000004', 'Fast Lightning Cable', 'MFi certified 6ft braided cable.', 14.00, 20, 'Electronics', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=400');

-- The Diamond Grill
insert into products (vendor_id, name, description, price, stock, category, image_url) values
  ('a1000000-0000-0000-0000-000000000005', 'Prime Ribeye', 'Hand-cut 12oz ribeye with garlic mash.', 34.00, 15, 'Grills', 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000005', 'The Diamond Burger', 'Wagyu beef, aged cheddar, bacon jam.', 16.50, 25, 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000005', 'Buffalo Wings', '12 crispy wings tossed in house hot sauce.', 14.00, 35, 'Sides', 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=400'),
  ('a1000000-0000-0000-0000-000000000005', 'Sparkling Lemonade', 'Traditional lemonade with fine bubbles.', 4.00, 50, 'Drinks', 'https://images.unsplash.com/photo-1523362628744-4c22397d416b?q=80&w=400');
