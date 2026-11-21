// Shopping Cart (Browser-এর localStorage-এ সংরক্ষিত থাকে)
import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch (e) {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // একই প্রোডাক্ট + Size + Color হলে একই লাইন, নইলে আলাদা লাইন
  const makeKey = (id, size, color) => `${id}|${size || ''}|${color || ''}`;

  const addToCart = (product, { size = '', color = '', quantity = 1 } = {}) => {
    const key = makeKey(product._id, size, color);
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) {
        const qty = Math.min(found.quantity + quantity, product.stock);
        return prev.map((i) => (i.key === key ? { ...i, quantity: qty, stock: product.stock, price: product.finalPrice } : i));
      }
      return [
        ...prev,
        {
          key,
          product: product._id,
          slug: product.slug,
          name: product.name,
          image: product.images?.[0]?.url || '',
          price: product.finalPrice,
          stock: product.stock,
          size,
          color,
          quantity: Math.min(quantity, product.stock),
        },
      ];
    });
    toast.success('Added to cart');
  };

  const updateQty = (key, quantity) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i)));

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  const clearCart = () => setItems([]);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeItem, clearCart, count, subtotal }}>{children}</CartContext.Provider>
  );
}
