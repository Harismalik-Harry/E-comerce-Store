import { create } from 'zustand';
import { cartAPI } from '@/api';
import toast from 'react-hot-toast';

const useCartStore = create((set, get) => ({
    items: [],
    total: 0,
    count: 0,
    loading: false,

    fetchCart: async () => {
        try {
            const res = await cartAPI.get();
            const { items, total, count } = res.data;
            set({ items, total, count });
        } catch {
            // Not logged in or error — ignore
        }
    },

    addToCart: async (productId, quantity = 1) => {
        set({ loading: true });
        try {
            await cartAPI.add({ product_id: productId, quantity });
            await get().fetchCart();
            toast.success('Added to cart!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add to cart');
        } finally {
            set({ loading: false });
        }
    },

    updateQuantity: async (cartItemId, quantity) => {
        try {
            await cartAPI.update(cartItemId, { quantity });
            await get().fetchCart();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update cart');
        }
    },

    removeItem: async (cartItemId) => {
        try {
            await cartAPI.remove(cartItemId);
            await get().fetchCart();
            toast.success('Item removed');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to remove item');
        }
    },

    clearCart: async () => {
        try {
            await cartAPI.clear();
            set({ items: [], total: 0, count: 0 });
            toast.success('Cart cleared');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to clear cart');
        }
    },

    resetCart: () => set({ items: [], total: 0, count: 0 }),
}));

export default useCartStore;
