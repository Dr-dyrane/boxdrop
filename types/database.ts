/* ─────────────────────────────────────────────────────
   DATABASE TYPES
   Auto-generated types should replace this file.
   Run `npx supabase gen types typescript` to regenerate.
   ───────────────────────────────────────────────────── */

export type UserRole = "user" | "vendor" | "courier";

export type OrderStatus =
    | "pending"
    | "confirmed"
    | "preparing"
    | "picked_up"
    | "in_transit"
    | "delivered"
    | "cancelled";

export interface Profile {
    id: string;
    role: UserRole;
    full_name: string | null;
    phone: string | null;
    email: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface Vendor {
    id: string;
    owner_id: string;
    name: string;
    description: string | null;
    address: string | null;     // Physical address text
    location: any;               // ST_Point geography
    rating: number;
    category: string | null;
    is_featured: boolean;
    logo_url: string | null;
    cover_url: string | null;
    created_at: string;
}

export interface Product {
    id: string;
    vendor_id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    stock: number;
    category: string | null;
    is_available: boolean;
    created_at: string;
}

export interface Order {
    id: string;
    user_id: string;
    vendor_id: string;
    courier_id: string | null;
    courier_lat: number | null; // For live tracking
    courier_lng: number | null; // For live tracking
    status: OrderStatus;
    total: number;
    delivery_location: string | null;
    delivery_lat: number | null;
    delivery_lng: number | null;
    progress: number | null;
    notes: string | null;

    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
}

/* ─────────────────────────────────────────────────────
   SUPABASE DATABASE TYPE (placeholder)
   Replace with generated types for full type safety.
   ───────────────────────────────────────────────────── */

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: any;
                Update: any;
                Relationships: any[];
            };
            vendors: {
                Row: Vendor;
                Insert: any;
                Update: any;
                Relationships: any[];
            };
            products: {
                Row: Product;
                Insert: any;
                Update: any;
                Relationships: any[];
            };
            orders: {
                Row: Order;
                Insert: any;
                Update: any;
                Relationships: any[];
            };
            order_items: {
                Row: OrderItem;
                Insert: any;
                Update: any;
                Relationships: any[];
            };
        };
        Views: Record<string, any>;
        Functions: {
            get_nearby_vendors: {
                Args: {
                    user_lat: number;
                    user_long: number;
                    radius_meters?: number;
                };
                Returns: (Vendor & { dist_meters: number })[];
            };
        };
        Enums: {
            user_role: UserRole;
            order_status: OrderStatus;
        };
        CompositeTypes: Record<string, any>;
    };
};
