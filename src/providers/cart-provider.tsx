"use client";

import * as React from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  manufacturer?: string;
  category?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "medi-store-cart";

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);

  React.useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_KEY);

    if (!savedCart) {
      return;
    }

    try {
      const parsed = JSON.parse(savedCart) as CartItem[];
      setItems(parsed);
    } catch {
      setItems([]);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = React.useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((previousItems) => {
      const existingItem = previousItems.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        return previousItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      return [...previousItems, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = React.useCallback((itemId: string) => {
    setItems((previousItems) => previousItems.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = React.useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) {
      return;
    }

    setItems((previousItems) =>
      previousItems.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
    );
  }, []);

  const clearCart = React.useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = React.useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const value = React.useMemo(
    () => ({
      items,
      totalItems,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, totalItems, addItem, removeItem, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = React.useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
