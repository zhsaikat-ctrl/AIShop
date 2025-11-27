import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // ✅ StrictMode-safe lazy init
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("aishop_cart");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      localStorage.removeItem("aishop_cart");
      return [];
    }
  });

  // ✅ persist
  useEffect(() => {
    localStorage.setItem("aishop_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    if (!product?._id) return;

    setCart((prev) => {
      const existing = prev.find((p) => p._id === product._id);
      if (existing) {
        return prev.map((p) =>
          p._id === product._id
            ? { ...p, qty: (Number(p.qty) || 1) + qty }
            : p
        );
      }
      return [...prev, { ...product, qty: Number(qty) || 1 }];
    });
  };

  const updateQty = (id, qty) => {
    setCart((prev) =>
      prev.map((p) => (p._id === id ? { ...p, qty: Number(qty) || 1 } : p))
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p._id !== id));
  };

  const clearCart = () => setCart([]);

  const total = useMemo(
    () =>
      cart.reduce((sum, i) => {
        const price = Number(i.price) || 0;
        const q = Number(i.qty) || 1;
        return sum + price * q;
      }, 0),
    [cart]
  );

  const count = useMemo(
    () => cart.reduce((sum, i) => sum + (Number(i.qty) || 1), 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQty, removeFromCart, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
