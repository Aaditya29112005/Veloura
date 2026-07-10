"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size: string;
  color: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    images: { url: string; isPrimary: boolean }[];
  };
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity: number, size: string, color: string, productData?: any) => Promise<{ error?: string }>;
  updateQuantity: (productId: string, quantity: number, size: string, color: string) => Promise<{ error?: string }>;
  removeFromCart: (productId: string, size: string, color: string) => Promise<{ error?: string }>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartSubtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const prevUserRef = useRef<string | null>(null);

  // Load cart on startup or auth state changes
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        try {
          // If transitioning from logged out to logged in, merge local storage cart with server
          const localCart = localStorage.getItem("luxury_cart");
          if (localCart) {
            const parsedItems = JSON.parse(localCart);
            for (const item of parsedItems) {
              await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  productId: item.productId,
                  quantity: item.quantity,
                  size: item.size,
                  color: item.color,
                }),
              });
            }
            localStorage.removeItem("luxury_cart");
          }

          // Fetch fresh server cart
          const res = await fetch("/api/cart");
          if (res.ok) {
            const data = await res.json();
            setCartItems(data.items || []);
          }
        } catch (err) {
          console.error("Failed to load server cart", err);
        }
      } else {
        // Load guest cart from localStorage
        const localCart = localStorage.getItem("luxury_cart");
        if (localCart) {
          try {
            setCartItems(JSON.parse(localCart));
          } catch (e) {
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      }
      setLoading(false);
    };

    // Prevent redundant calls, trigger load when user ID changes
    const currentUserId = user ? user.id : null;
    if (currentUserId !== prevUserRef.current || loading) {
      prevUserRef.current = currentUserId;
      loadCart();
    }
  }, [user]);

  // Sync guest cart to localStorage
  const syncLocalCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem("luxury_cart", JSON.stringify(items));
  };

  const addToCart = async (productId: string, quantity: number, size: string, color: string, productData?: any) => {
    if (user) {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity, size, color }),
        });

        const data = await res.json();
        if (!res.ok) {
          return { error: data.error || "Failed to add to cart" };
        }

        // Reload cart from server to keep sync
        const freshRes = await fetch("/api/cart");
        if (freshRes.ok) {
          const freshData = await freshRes.json();
          setCartItems(freshData.items || []);
        }
        return {};
      } catch (err) {
        return { error: "Network error. Failed to add to cart." };
      }
    } else {
      // Guest cart logic
      if (!productData) {
        return { error: "Product information missing" };
      }

      // Check stock
      if (quantity > productData.stock) {
        return { error: `Only ${productData.stock} items available in stock` };
      }

      const existingIndex = cartItems.findIndex(
        (item) => item.productId === productId && item.size === size && item.color === color
      );

      let newItems = [...cartItems];
      if (existingIndex > -1) {
        const newQty = newItems[existingIndex].quantity + quantity;
        if (newQty > productData.stock) {
          return { error: `Cannot add more. Max stock is ${productData.stock}.` };
        }
        newItems[existingIndex].quantity = newQty;
      } else {
        const tempId = `local-${Date.now()}-${Math.random()}`;
        newItems.push({
          id: tempId,
          productId,
          quantity,
          size,
          color,
          product: {
            id: productData.id,
            name: productData.name,
            slug: productData.slug,
            price: productData.price,
            stock: productData.stock,
            images: productData.images || [],
          },
        });
      }

      syncLocalCart(newItems);
      return {};
    }
  };

  const updateQuantity = async (productId: string, quantity: number, size: string, color: string) => {
    if (user) {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity, size, color }),
        });

        const data = await res.json();
        if (!res.ok) {
          return { error: data.error || "Failed to update quantity" };
        }

        const freshRes = await fetch("/api/cart");
        if (freshRes.ok) {
          const freshData = await freshRes.json();
          setCartItems(freshData.items || []);
        }
        return {};
      } catch (err) {
        return { error: "Network error" };
      }
    } else {
      const idx = cartItems.findIndex(
        (item) => item.productId === productId && item.size === size && item.color === color
      );

      if (idx > -1) {
        let newItems = [...cartItems];
        if (quantity <= 0) {
          newItems.splice(idx, 1);
        } else {
          if (quantity > newItems[idx].product.stock) {
            return { error: `Only ${newItems[idx].product.stock} items available in stock` };
          }
          newItems[idx].quantity = quantity;
        }
        syncLocalCart(newItems);
      }
      return {};
    }
  };

  const removeFromCart = async (productId: string, size: string, color: string) => {
    return updateQuantity(productId, 0, size, color);
  };

  const clearCart = async () => {
    if (user) {
      try {
        await fetch("/api/cart", { method: "DELETE" });
        setCartItems([]);
      } catch (err) {
        console.error("Failed to clear cart", err);
      }
    } else {
      syncLocalCart([]);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
