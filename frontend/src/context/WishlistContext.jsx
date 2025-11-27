import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // ✅ backend যেভাবেই পাঠাক, array বানিয়ে নেবে
  const normalizeWishlist = (data) => {
    if (Array.isArray(data)) return data;          // your backend returns array ✅
    if (Array.isArray(data?.wishlist)) return data.wishlist;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  };

  const fetchWishlist = async () => {
    if (!user?.token) {
      setWishlist([]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Wishlist load failed");

      setWishlist(normalizeWishlist(data));
    } catch (err) {
      console.log("fetchWishlist error:", err);
      setWishlist([]);
    }
  };

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  const add = async (productId) => {
    if (!user?.token) return alert("Login first");

    try {
      const res = await fetch(`${API_URL}/wishlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Already in wishlist");

      await fetchWishlist();
    } catch (err) {
      console.log("wishlist add error:", err);
      alert(err.message || "Add failed");
    }
  };

  const remove = async (productId) => {
    if (!user?.token) return;

    try {
      const res = await fetch(`${API_URL}/wishlist/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Remove failed");

      await fetchWishlist();
    } catch (err) {
      console.log("wishlist remove error:", err);
      alert(err.message || "Remove failed");
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, add, remove }}>
      {children}
    </WishlistContext.Provider>
  );
}
