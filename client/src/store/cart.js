import { create } from 'zustand';
import { persist } from 'zustand/middleware';

let flightId = 0;

export const useCart = create(
  persist(
    (set, get) => ({
      items: [], // { id, name, size, price, look, qty }
      open: false,
      bump: 0, // increments whenever something lands in the cart (drives the icon wiggle)
      flights: [], // fly-to-cart particles { id, x, y, color }
      toast: null,

      add(product, qty = 1, from) {
        const items = get().items;
        const cap = Math.min(50, product.stock ?? 50);
        const existing = items.find((i) => i.id === product.id);
        const next = existing
          ? items.map((i) => (i.id === product.id ? { ...i, qty: Math.min(i.qty + qty, cap) } : i))
          : [...items, { id: product.id, name: product.name, size: product.size, price: product.price, look: product.look, stock: product.stock, qty: Math.min(qty, cap) }];
        set({ items: next, toast: { id: Date.now(), name: product.name, qty } });
        if (from) set((s) => ({ flights: [...s.flights, { id: ++flightId, ...from, color: product.look.label }] }));
        else set((s) => ({ bump: s.bump + 1 }));
      },
      land(id) {
        set((s) => ({ flights: s.flights.filter((f) => f.id !== id), bump: s.bump + 1 }));
      },
      setQty(id, qty) {
        if (qty < 1) return get().remove(id);
        set({ items: get().items.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, 50, i.stock ?? 50) } : i)) });
      },
      remove(id) {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      clear() {
        set({ items: [] });
      },
      // Keep cached prices/looks in sync with the live catalogue and drop discontinued items.
      sync(products) {
        const byId = new Map(products.map((p) => [p.id, p]));
        set({
          items: get().items
            .filter((i) => byId.get(i.id)?.stock > 0)
            .map((i) => {
              const p = byId.get(i.id);
              return { ...i, name: p.name, price: p.price, look: p.look, size: p.size, stock: p.stock, qty: Math.max(1, Math.min(i.qty, p.stock)) };
            }),
        });
      },
      setOpen(open) {
        set({ open });
      },
      dismissToast() {
        set({ toast: null });
      },
    }),
    { name: 'anjugu-cart', partialize: (s) => ({ items: s.items }) },
  ),
);

export const useCartCount = () => useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
export const useCartSubtotal = () => useCart((s) => s.items.reduce((n, i) => n + i.qty * i.price, 0));
