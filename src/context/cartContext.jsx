import { createContext, useState, useMemo } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartEditing, setIsCartEditing] = useState(false);
  const [cartId, setCartId] = useState(null);
  const [cartSaved, setCartSaved] = useState(false);

  const updateCart = (items) => setCartItems(items);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + (item.total_price || 0),
      0
    );
  }, [cartItems]);

  const deliveryFee = 300;
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        subtotal,
        deliveryFee,
        total,
        isCartEditing,
        cartId,
        cartSaved,
        updateCart,
        setCartId,
        setIsCartEditing,
        setCartSaved,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
