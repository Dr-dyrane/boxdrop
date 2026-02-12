-- 1. Drop existing policies to avoid conflicts
drop policy if exists "Order items visible to order owner" on order_items;
drop policy if exists "Order items are visible to order stakeholders" on order_items;
drop policy if exists "Users can insert items into their own orders" on order_items;

-- 2. Create the enhanced SELECT policy
-- Allows both the Customer and the Vendor/Owner to see the items
create policy "Order items are visible to order stakeholders"
on order_items
for select
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
    and (
      orders.user_id = auth.uid() 
      or 
      exists (
        select 1 from public.vendors 
        where vendors.id = orders.vendor_id 
        and vendors.owner_id = auth.uid()
      )
    )
  )
);

-- 3. Create the INSERT policy (The Fix)
-- Crucial: Explicitly type-cast and reference the table to avoid ambiguity
create policy "Users can insert items into their own orders"
on order_items
for insert
to authenticated
with check (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  )
);

-- 4. Enable updated_at automation for orders and profiles if missed
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Check if triggers exist before creating them (or drop and recreate)
drop trigger if exists on_profiles_updated on profiles;
create trigger on_profiles_updated
  before update on profiles
  for each row execute procedure handle_updated_at();

drop trigger if exists on_orders_updated on orders;
create trigger on_orders_updated
  before update on orders
  for each row execute procedure handle_updated_at();
