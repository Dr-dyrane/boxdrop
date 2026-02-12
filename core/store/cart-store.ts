import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/database";

/* ─────────────────────────────────────────────────────
   CART STORE
   Manages cart items with quantities.
   Persisted to localStorage for session survival.
   ───────────────────────────────────────────────────── */

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    vendorId: string | null;

    // Actions
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;

    // Derived
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            vendorId: null,

            addItem: (product) => {
                const { items, vendorId } = get();

                // If cart has items from a different vendor, clear first
                if (vendorId && vendorId !== product.vendor_id) {
                    set({ items: [{ product, quantity: 1 }], vendorId: product.vendor_id });
                    return;
                }

                const existingIndex = items.findIndex(
                    (item) => item.product.id === product.id
                );

                if (existingIndex >= 0) {
                    const updated = [...items];
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        quantity: updated[existingIndex].quantity + 1,
                    };
                    set({ items: updated });
                } else {
                    set({
                        items: [...items, { product, quantity: 1 }],
                        vendorId: product.vendor_id,
                    });
                }
            },

            removeItem: (productId) => {
                const updatedItems = get().items.filter(
                    (item) => item.product.id !== productId
                );
                set({
                    items: updatedItems,
                    vendorId: updatedItems.length > 0 ? get().vendorId : null,
                });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set({
                    items: get().items.map((item) =>
                        item.product.id === productId ? { ...item, quantity } : item
                    ),
                });
            },

            clearCart: () => set({ items: [], vendorId: null }),

            getTotal: () =>
                get().items.reduce(
                    (sum, item) => sum + item.product.price * item.quantity,
                    0
                ),

            getItemCount: () =>
                get().items.reduce((sum, item) => sum + item.quantity, 0),
        }),
        {
            name: "boxdrop-cart",
        }
    )
);
