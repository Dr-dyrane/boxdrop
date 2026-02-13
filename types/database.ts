/* ─────────────────────────────────────────────────────
   DATABASE TYPES
   Auto-generated types should replace this file.
   Run `npx supabase gen types typescript` to regenerate.
   ───────────────────────────────────────────────────── */

export type UserRole = "user" | "vendor" | "courier" | "admin" | "support";

export type OrderStatus =
    | "pending"
    | "confirmed"
    | "preparing"
    | "picked_up"
    | "in_transit"
    | "delivered"
    | "cancelled";

export type Profile = {
    id: string;
    role: UserRole;
    full_name: string | null;
    phone: string | null;
    email: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
};

export type UserAddress = any;

export type Notification = {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    metadata: any;
    created_at: string;
};

export type Vendor = {
    id: string;
    owner_id: string;
    name: string;
    description: string | null;
    address: string | null;
    location: any;
    rating: number;
    category: string | null;
    is_featured: boolean;
    logo_url: string | null;
    cover_url: string | null;
    created_at: string;
};

export type Product = {
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
};

export type Order = {
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
};

export type OrderItem = any; // Placeholders for now

/* ─────────────────────────────────────────────────────
   SUPABASE DATABASE TYPE (placeholder)
   Replace with generated types for full type safety.
   ───────────────────────────────────────────────────── */

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: {
                    id: string;
                    role?: UserRole;
                    full_name?: string | null;
                    phone?: string | null;
                    email?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    role?: UserRole;
                    full_name?: string | null;
                    phone?: string | null;
                    email?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: any[];
            };
            vendors: {
                Row: Vendor;
                Insert: {
                    id?: string;
                    owner_id?: string;
                    name: string;
                    description?: string | null;
                    address?: string | null;
                    location?: any;
                    rating?: number;
                    category?: string | null;
                    is_featured?: boolean;
                    logo_url?: string | null;
                    cover_url?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    owner_id?: string;
                    name?: string;
                    description?: string | null;
                    address?: string | null;
                    location?: any;
                    rating?: number;
                    category?: string | null;
                    is_featured?: boolean;
                    logo_url?: string | null;
                    cover_url?: string | null;
                    created_at?: string;
                };
                Relationships: any[];
            };
            products: {
                Row: Product;
                Insert: {
                    id?: string;
                    vendor_id: string;
                    name: string;
                    description?: string | null;
                    price: number;
                    image_url?: string | null;
                    stock?: number;
                    category?: string | null;
                    is_available?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    vendor_id?: string;
                    name?: string;
                    description?: string | null;
                    price?: number;
                    image_url?: string | null;
                    stock?: number;
                    category?: string | null;
                    is_available?: boolean;
                    created_at?: string;
                };
                Relationships: any[];
            };
            orders: {
                Row: Order;
                Insert: {
                    id?: string;
                    user_id: string;
                    vendor_id: string;
                    courier_id?: string | null;
                    courier_lat?: number | null;
                    courier_lng?: number | null;
                    status?: OrderStatus;
                    total: number;
                    delivery_location?: string | null;
                    delivery_lat?: number | null;
                    delivery_lng?: number | null;
                    progress?: number | null;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    vendor_id?: string;
                    courier_id?: string | null;
                    courier_lat?: number | null;
                    courier_lng?: number | null;
                    status?: OrderStatus;
                    total?: number;
                    delivery_location?: string | null;
                    delivery_lat?: number | null;
                    delivery_lng?: number | null;
                    progress?: number | null;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: any[];
            };
            order_items: {
                Row: OrderItem;
                Insert: {
                    id?: string;
                    order_id: string;
                    product_id: string;
                    quantity?: number;
                    unit_price: number;
                };
                Update: {
                    id?: string;
                    order_id?: string;
                    product_id?: string;
                    quantity?: number;
                    unit_price?: number;
                };
                Relationships: any[];
            };
            addresses: {
                Row: UserAddress;
                Insert: {
                    id?: string;
                    user_id: string;
                    label: string;
                    address: string;
                    lat: number;
                    lng: number;
                    is_default?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    label?: string;
                    address?: string;
                    lat?: number;
                    lng?: number;
                    is_default?: boolean;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "addresses_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            notifications: {
                Row: Notification;
                Insert: {
                    id?: string;
                    user_id: string;
                    type: string;
                    title: string;
                    message: string;
                    is_read?: boolean;
                    metadata?: any;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    type?: string;
                    title?: string;
                    message?: string;
                    is_read?: boolean;
                    metadata?: any;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "notifications_user_id_fkey";
                        columns: ["user_id"];
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
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
