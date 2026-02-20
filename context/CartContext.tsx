"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import { CartItem, Product, FlavorSelection, getItemPrice, serializeFlavors } from "@/types";

const CART_STORAGE_KEY = "cashew-shop-cart";

export function getDiscountRate(totalQuantity: number): number {
  if (totalQuantity >= 5) return 0.1;
  if (totalQuantity >= 3) return 0.05;
  return 0;
}

export function getNextDiscountStep(totalQuantity: number): {
  remaining: number;
  nextRate: number;
} | null {
  if (totalQuantity < 3) return { remaining: 3 - totalQuantity, nextRate: 5 };
  if (totalQuantity < 5) return { remaining: 5 - totalQuantity, nextRate: 10 };
  return null;
}

function cartItemKey(productId: string, sizeG: number | null, flavors?: FlavorSelection | null): string {
  const base = sizeG ? `${productId}__${sizeG}` : productId;
  const flavorStr = serializeFlavors(flavors ?? null);
  return flavorStr ? `${base}__f:${flavorStr}` : base;
}

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, sizeG?: number | null, flavors?: FlavorSelection | null) => void;
  removeFromCart: (productId: string, sizeG?: number | null, flavors?: FlavorSelection | null) => void;
  updateQuantity: (productId: string, quantity: number, sizeG?: number | null, flavors?: FlavorSelection | null) => void;
  clearCart: () => void;
  totalQuantity: number;
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  nextDiscountStep: { remaining: number; nextRate: number } | null;
};

const CartContext = createContext<CartContextType | null>(null);

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveCart(items);
  }, [items, hydrated]);

  const addToCart = useCallback(
    (product: Product, quantity = 1, sizeG: number | null = null, flavors: FlavorSelection | null = null) => {
      setItems((prev) => {
        const key = cartItemKey(product.id, sizeG, flavors);
        const existing = prev.find(
          (item) => cartItemKey(item.product.id, item.selectedSizeG, item.selectedFlavors) === key
        );
        if (existing) {
          return prev.map((item) =>
            cartItemKey(item.product.id, item.selectedSizeG, item.selectedFlavors) === key
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, quantity, selectedSizeG: sizeG, selectedFlavors: flavors }];
      });
    },
    []
  );

  const removeFromCart = useCallback(
    (productId: string, sizeG: number | null = null, flavors: FlavorSelection | null = null) => {
      const key = cartItemKey(productId, sizeG, flavors);
      setItems((prev) =>
        prev.filter(
          (item) => cartItemKey(item.product.id, item.selectedSizeG, item.selectedFlavors) !== key
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, sizeG: number | null = null, flavors: FlavorSelection | null = null) => {
      const key = cartItemKey(productId, sizeG, flavors);
      if (quantity <= 0) {
        setItems((prev) =>
          prev.filter(
            (item) => cartItemKey(item.product.id, item.selectedSizeG, item.selectedFlavors) !== key
          )
        );
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          cartItemKey(item.product.id, item.selectedSizeG, item.selectedFlavors) === key
            ? { ...item, quantity }
            : item
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        return sum + getItemPrice(item) * item.quantity;
      }, 0),
    [items]
  );

  const discountRate = useMemo(
    () => getDiscountRate(totalQuantity),
    [totalQuantity]
  );
  const discountAmount = useMemo(
    () => Math.floor(subtotal * discountRate),
    [subtotal, discountRate]
  );
  const total = useMemo(
    () => subtotal - discountAmount,
    [subtotal, discountAmount]
  );
  const nextDiscountStep = useMemo(
    () => getNextDiscountStep(totalQuantity),
    [totalQuantity]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalQuantity,
        subtotal,
        discountRate,
        discountAmount,
        total,
        nextDiscountStep,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
