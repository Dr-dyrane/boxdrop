-- ═══════════════════════════════════════════════════
-- BOXDROP SEED DATA
-- Run this AFTER schema.sql in your Supabase SQL Editor.
-- ═══════════════════════════════════════════════════

-- ──────────────────────────────────────────────────
-- VENDORS (5 premium mock vendors)
-- ──────────────────────────────────────────────────

insert into vendors (id, name, description, location, rating, is_featured) values
  ('a1000000-0000-0000-0000-000000000001', 'Cloud Kitchen', 'Premium cloud kitchen serving gourmet meals with express delivery.', 'Victoria Island, Lagos', 4.8, true),
  ('a1000000-0000-0000-0000-000000000002', 'Fresh & Fast', 'Farm-to-door grocery delivery. Fresh produce, zero compromise.', 'Lekki Phase 1, Lagos', 4.6, true),
  ('a1000000-0000-0000-0000-000000000003', 'Urban Bites', 'Street food elevated. Bold flavors, premium packaging.', 'Ikeja GRA, Lagos', 4.9, true),
  ('a1000000-0000-0000-0000-000000000004', 'QuickMart', 'Convenience store essentials delivered in 30 minutes.', 'Surulere, Lagos', 4.5, false),
  ('a1000000-0000-0000-0000-000000000005', 'The Grill House', 'Charcoal-grilled perfection. Steaks, burgers, and more.', 'Ikoyi, Lagos', 4.7, false);

-- ──────────────────────────────────────────────────
-- PRODUCTS (4 per vendor = 20 products)
-- ──────────────────────────────────────────────────

-- Cloud Kitchen
insert into products (vendor_id, name, description, price, stock, category) values
  ('a1000000-0000-0000-0000-000000000001', 'Jollof Rice Bowl', 'Signature smoky jollof with grilled chicken.', 3500, 50, 'Mains'),
  ('a1000000-0000-0000-0000-000000000001', 'Pepper Soup', 'Spicy goat meat pepper soup with yam.', 4000, 30, 'Soups'),
  ('a1000000-0000-0000-0000-000000000001', 'Grilled Fish Platter', 'Whole tilapia with plantain and coleslaw.', 5500, 20, 'Mains'),
  ('a1000000-0000-0000-0000-000000000001', 'Chapman Drink', 'Classic Nigerian cocktail, freshly mixed.', 1200, 100, 'Drinks');

-- Fresh & Fast
insert into products (vendor_id, name, description, price, stock, category) values
  ('a1000000-0000-0000-0000-000000000002', 'Organic Veggie Box', 'Seasonal vegetables, locally sourced.', 6000, 25, 'Produce'),
  ('a1000000-0000-0000-0000-000000000002', 'Fruit Basket', 'Mixed tropical fruits — mango, pineapple, pawpaw.', 4500, 40, 'Produce'),
  ('a1000000-0000-0000-0000-000000000002', 'Fresh Eggs (Crate)', '30 farm-fresh eggs.', 3800, 60, 'Dairy'),
  ('a1000000-0000-0000-0000-000000000002', 'Cold-Pressed Juice Pack', '6 bottles of mixed fruit juice.', 5000, 35, 'Drinks');

-- Urban Bites
insert into products (vendor_id, name, description, price, stock, category) values
  ('a1000000-0000-0000-0000-000000000003', 'Suya Platter', 'Premium beef suya with spicy yaji seasoning.', 3000, 45, 'Street Food'),
  ('a1000000-0000-0000-0000-000000000003', 'Shawarma Wrap', 'Loaded chicken shawarma with garlic sauce.', 2500, 50, 'Street Food'),
  ('a1000000-0000-0000-0000-000000000003', 'Puff-Puff Box', '12 golden puff-puffs with chocolate dip.', 1500, 60, 'Snacks'),
  ('a1000000-0000-0000-0000-000000000003', 'Zobo Drink', 'Chilled hibiscus drink with pineapple and ginger.', 800, 80, 'Drinks');

-- QuickMart
insert into products (vendor_id, name, description, price, stock, category) values
  ('a1000000-0000-0000-0000-000000000004', 'Toiletries Bundle', 'Essential toiletries pack — soap, paste, tissue.', 4200, 30, 'Essentials'),
  ('a1000000-0000-0000-0000-000000000004', 'Snack Box', 'Assorted biscuits, chips, and chocolate.', 3500, 40, 'Snacks'),
  ('a1000000-0000-0000-0000-000000000004', 'Water Pack (12)', '12 bottles of premium spring water.', 2000, 100, 'Drinks'),
  ('a1000000-0000-0000-0000-000000000004', 'Phone Charger (USB-C)', 'Fast-charge USB-C cable, 1.5m.', 3000, 20, 'Electronics');

-- The Grill House
insert into products (vendor_id, name, description, price, stock, category) values
  ('a1000000-0000-0000-0000-000000000005', 'Ribeye Steak', '300g charcoal-grilled ribeye with sides.', 12000, 15, 'Grills'),
  ('a1000000-0000-0000-0000-000000000005', 'BBQ Burger', 'Double patty burger with caramelized onions.', 5500, 25, 'Burgers'),
  ('a1000000-0000-0000-0000-000000000005', 'Chicken Wings (12pc)', 'Smoky BBQ wings with ranch dip.', 4500, 35, 'Sides'),
  ('a1000000-0000-0000-0000-000000000005', 'Craft Lemonade', 'House-made lemonade with mint and honey.', 1500, 50, 'Drinks');
