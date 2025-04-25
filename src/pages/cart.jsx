import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import cartBg from "../assets/images/crt2.jpg";
import { CartContext } from "../context/cartContext";
import { useSaveCart } from "../hooks/useSaveCartDetails";
import { useAuth } from "../context/authContext";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateCart, customer } = useContext(CartContext);

  const [cartItems, setCartItems] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );
  const [cartSaved, setCartSaved] = useState(false);

  const { mutate: saveCart, isLoading } = useSaveCart();

  const handleSaveCart = () => {
    if (!user || !user._id) {
      alert("Customer information is not available. Please log in again.");
      return;
    }

    const cartData = {
      cart_id: `cart_${Date.now()}`,
      customer: user._id,
      meals: cartItems.map((item) => ({
        meal: item.meal,
        meal_name: item.meal_name,
        meal_price: item.meal_price,
        quantity: item.quantity,
        total_price: total,
      })),
    };

    saveCart(cartData, {
      onSuccess: () => {
        alert("Cart saved successfully!");
        setCartSaved(true);
      },
      onError: () => {
        alert("Failed to save cart. Please try again.");
      },
    });
  };

  const handleIncrease = (id) => {
    if (cartSaved) return;
    setCartItems(
      cartItems.map((item) =>
        item.meal === id
          ? {
              ...item,
              quantity: item.quantity + 1,
              total_price: item.meal_price * (item.quantity + 1),
            }
          : item
      )
    );
  };

  const handleDecrease = (id) => {
    if (cartSaved) return;
    setCartItems(
      cartItems.map((item) =>
        item.meal === id && item.quantity > 1
          ? {
              ...item,
              quantity: item.quantity - 1,
              total_price: item.meal_price * (item.quantity - 1),
            }
          : item
      )
    );
  };

  const handleRemove = (id) => {
    if (cartSaved) return;
    setCartItems(cartItems.filter((item) => item.meal !== id));
  };

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    updateCart(cartItems);
  }, [cartItems, updateCart]);

  const subtotal = cartItems.reduce(
    (total, item) => total + (item.total_price || 0),
    0
  );
  const deliveryFee = 300;
  const total = subtotal + deliveryFee;

  if (customer === null) {
    return <div>Loading customer information...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      <div
        className="absolute top-0 left-0 w-full h-full bg-black opacity-80"
        style={{
          backgroundImage: `url(${cartBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      <div className="flex flex-col items-center flex-grow p-6 relative z-10">
        <h1 className="text-3xl font-bold mb-6 text-black">Your Cart</h1>

        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl opacity-90">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Title</th>
                <th className="p-2">Price</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Total</th>
                <th className="p-2">Update</th>
                <th className="p-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.meal} className="border-b">
                  <td className="p-2">{item.meal_name}</td>
                  <td className="p-2">
                    Rs: {item.meal_price?.toFixed(2) || "N/A"}
                  </td>
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2">
                    Rs: {item.total_price?.toFixed(2) || "N/A"}
                  </td>
                  <td className="p-2 flex items-center space-x-2">
                    <button
                      onClick={() => handleIncrease(item.meal)}
                      className="px-2 py-1 bg-gray-300 rounded text-lg font-bold"
                      disabled={cartSaved}
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleDecrease(item.meal)}
                      className="px-2 py-1 bg-gray-300 rounded text-lg font-bold"
                      disabled={cartSaved}
                    >
                      -
                    </button>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handleRemove(item.meal)}
                      className="text-gray-600 hover:text-red-500 text-lg"
                      disabled={cartSaved}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 text-lg text-black">
            <div className="flex justify-between border-t pt-2">
              <span>Subtotal:</span>
              <span>Rs: {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Delivery Fee:</span>
              <span>Rs: {deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl border-t pt-2">
              <span>Total:</span>
              <span>Rs: {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => navigate(ROUTES.MENU)}
              className={`${
                cartSaved
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white px-4 py-2 rounded-lg transition`}
              disabled={cartSaved}
            >
              Add more Meals
            </button>
            <button
              onClick={() => navigate(ROUTES.PAYMENT)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Proceed To Check Out
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={handleSaveCart}
              disabled={isLoading || cartSaved}
              className={`${
                cartSaved
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white px-6 py-2 rounded-lg transition`}
            >
              {isLoading ? "Saving..." : cartSaved ? "Cart Saved" : "Save Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
