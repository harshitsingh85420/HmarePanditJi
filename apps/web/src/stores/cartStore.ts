import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SamagriItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  samagriItem: SamagriItem | null;
  isCartOpen: boolean;

  setSamagriItem: (item: SamagriItem) => void;
  clearCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      samagriItem: null,
      isCartOpen: false,

      setSamagriItem: (item) =>
        set({ samagriItem: item, isCartOpen: true }),
      clearCart: () => set({ samagriItem: null, isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    }),
    {
      name: "cart-storage",
    }
  )
);
