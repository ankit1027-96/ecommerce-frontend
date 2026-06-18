"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  // Fetching cart whenever user logs in or out
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      Promise.resolve().then(() => setCart(null));
    }
  }, [user]);

  async function fetchCart() {
    try {
      setCartLoading(true);
      const { data } = await api.get("/api/cart");
      setCart(data.data);
    } catch (err) {
      // Cart fetch failing shouldn't break the app
      setCart(null);
    } finally {
      setCartLoading(false);
    }
  }

  async function addToCart(productId, quantity = 1) {
    try {
      const { data } = await api.post("/api/cart/items", {
        productId,
        quantity,
      });
      setCart(data.data);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to add item",
      };
    }
  }

  async function updateQuantity(productId, quantity) {
    try {
      const { data } = await api.put(`/api/cart/items/${productId}`, {
        quantity,
      });
      setCart(data.data);
    } catch (err) {
      console.error("Update quantity failed", err);
    }
  }

  async function removeFromCart(productId) {
    try {
      const { data } = await api.delete(`/api/cart/items/${productId}`);
      setCart(data.data);
    } catch (err) {
      console.error("Clear cart failed", err);
    }
  }

  async function clearCart() {
    try {
      await api.delete("/api/cart");
      setCart(null);
    } catch (err) {
      console.error("clear cart failed", err);
    }
  }

  // Total number of items in the cart for navbar icon
  const cartCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLoading,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
