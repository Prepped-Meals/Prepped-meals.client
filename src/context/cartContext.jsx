// import { createContext, useState } from "react";

// export const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState([]);

//   // Dummy function
//   const updateCart = (items) => setCartItems(items);

//   return (
//     <CartContext.Provider value={{ cartItems, updateCart }}>
//       {children}
//     </CartContext.Provider>
//   );
// };
import { createContext, useState, useMemo } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const updateCart = (items) => setCartItems(items);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.total_price || 0), 0);
  }, [cartItems]);

  const deliveryFee = 300; // fixed delivery fee
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{ cartItems, updateCart, subtotal, deliveryFee, total }}
    >
      {children}
    </CartContext.Provider>
  );
};
