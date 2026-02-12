import { createClient } from "@/lib/supabase/client";
import type { Order, OrderItem } from "@/types/database";

/* ─────────────────────────────────────────────────────
   ORDER SERVICE
   Pure data functions. No UI logic.
   ───────────────────────────────────────────────────── */

interface CreateOrderInput {
    vendor_id: string;
    items: { product_id: string; quantity: number; unit_price: number }[];
    delivery_location: string;
    delivery_lat?: number;
    delivery_lng?: number;
    notes?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
    const supabase = createClient();

    const total = input.items.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0
    );

    // Get current user for RLS
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Authentication required to place an order");

    // Create order
    const { data: order, error: orderError } = await (supabase
        .from("orders" as any) as any)
        .insert({
            vendor_id: input.vendor_id,
            user_id: user.id,
            status: "pending",
            total,
            delivery_location: input.delivery_location,
            delivery_lat: input.delivery_lat ?? null,
            delivery_lng: input.delivery_lng ?? null,
            notes: input.notes ?? null,
            courier_id: null,
        } as any)
        .select()
        .single();

    if (orderError) throw orderError;
    if (!order) throw new Error("Failed to create order");

    const orderId = (order as any).id;

    // Create order items
    const orderItems = input.items.map((item) => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
    }));

    const { error: itemsError } = await (supabase
        .from("order_items" as any) as any)
        .insert(orderItems as any);

    if (itemsError) throw itemsError;

    return order as unknown as Order;
}

export async function fetchUserOrders(): Promise<Order[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

    if (error) throw error;
    return data ?? [];
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

    if (error) throw error;
    return data;
}
