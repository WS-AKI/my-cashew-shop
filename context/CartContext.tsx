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
import { CartItem, Product, SetFlavorSelection, SaltOption, getItemPrice, serializeSetFlavors } from "@/types";

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

function cartItemKey(productId: string, sizeG: number | null, flavors?: SetFlavorSelection | null, saltOption?: SaltOption | null): string {
  const base = sizeG ? `${productId}__${sizeG}` : productId;
  const flavorStr = serializeSetFlavors(flavors ?? null);
  const flavorPart = flavorStr ? `__f:${flavorStr}` : "";
  const saltPart = saltOption ? `__s:${saltOption}` : "";
  return `${base}${flavorPart}${saltPart}`;
}

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, sizeG?: number | null, flavors?: SetFlavorSelection | null, saltOption?: SaltOption | null) => void;
  removeFromCart: (productId: string, sizeG?: number | null, flavors?: SetFlavorSelection | null, saltOption?: SaltOption | null) => void;
  updateQuantity: (productId: string, quantity: number, sizeG?: number | null, flavors?: SetFlavorSelection | null, saltOption?: SaltOption | null) => void;
  clearCart: () => void;
  totalQuantity: number;
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  nextDiscountStep: { remaining: number; nextRate: number } | null;
};

const CartContext = createContext<CartContextType | null>(null);

/** 旧形式（FlavorSelection の original）を SetFlavorSelection に移行 */
function normalizeCartItem(item: CartItem): CartItem {
  const fl = item.selectedFlavors as Record<string, number> | null | undefined;
  if (fl && typeof fl === "object" && "original" in fl && typeof (fl as { original?: number }).original === "number") {
    const old = fl as { original?: number; cheese?: number; bbq?: number; nori?: number; tomyum?: number };
    const setFlavors: SetFlavorSelection = {
      original_salt: old.original ?? 0,
      original_nosalt: 0,
      cheese: old.cheese ?? 0,
      bbq: old.bbq ?? 0,
      nori: old.nori ?? 0,
      tomyum: old.tomyum ?? 0,
    };
    return { ...item, selectedFlavors: setFlavors };
  }
  return item;
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeCartItem);
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
    (product: Product, quantity = 1, sizeG: number | null = null, flavors: SetFlavorSelection | null = null, saltOption: SaltOption | null = null) => {
      setItems((prev) => {
        const key = cartItemKey(product.id, sizeG, flavors, saltOption);
        const existing = prev.find(
          (item) => cartItemKey(item.product.id, item.selectedSizeG, item.selectedFlavors, item.saltOption) === key
        );
        if (existing) {
          return prev.map((item) =>
            cartItemKey(item.product.id, item.selectedSizeG, item.selectedFlavors, item.saltOption) === key
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, quantity, selectedSizeG: sizeG, selectedFlavors: flavors, saltOption: saltOption ?? undefined }];
      });
    },
    []
  );

  const removeFromCart = useCallback(
    (productId: string, sizeG: number | null = null, flavors: SetFlavorSelection | null = null, saltOption: SaltOption | null = null) => {
      const key = cartItemKey(productId, sizeG, flavors, saltOption);
      setItems((prev) =>
        prev.filter(
          (item) => cartItemKey(item.product.id, item.selectedSizeG, item.selectedFlavors, item.saltOption) !== key
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, sizeG: number | null = null, flavors: SetFlavorSelection | null = null, saltOption: SaltOption | null = null) => {
      const key = cartItemKey(productId, sizeG, flavors, saltOption);
      if (quantity <= 0) {
        setItems((prev) =>
          prev.filter(
            (item) => cartItemKey(item.product.id, item.selectedSizeG, item.selectedFlavors, item.saltOption) !== key
          )
        );
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          cartItemKey(item.product.id, item.selectedSizeG, item.selectedFlavors, item.saltOption) === key
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
