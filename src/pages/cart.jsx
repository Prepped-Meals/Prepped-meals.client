import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/paths";

const Cart = () => {
  const navigate = useNavigate();

  // Sample cart items
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Chicken Tikka Masala with Rice",
      price: 1000,
      quantity: 2,
      image: "/images/chicken_tikka.jpg",
    },
    {
      id: 2,
      name: "Cabbage Salad",
      price: 500,
      quantity: 2,
      image: "/images/cabbage_salad.jpg",
    },
  ]);

  // Increase quantity
  const handleIncrease = (id) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrease quantity
  const handleDecrease = (id) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // Remove item from cart
  const handleRemove = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const deliveryFee = 300; // Fixed delivery fee
  const total = subtotal + deliveryFee;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F8F2]">
      {/* Cart Content */}
      <div className="flex flex-col items-center flex-grow p-6">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Item</th>
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
                <tr key={item.id} className="border-b">
                  <td className="p-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-md"
                    />
                  </td>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">Rs: {item.price.toFixed(2)}</td>
                  {/* Adjusted Quantity alignment */}
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2">
                    Rs: {(item.price * item.quantity).toFixed(2)}
                  </td>
                  {/* Update Column */}
                  <td className="p-2 flex items-center space-x-2">
                    <button
                      onClick={() => handleIncrease(item.id)}
                      className="px-2 py-1 bg-gray-300 rounded text-lg font-bold"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleDecrease(item.id)}
                      className="px-2 py-1 bg-gray-300 rounded text-lg font-bold"
                    >
                      -
                    </button>
                  </td>
                  {/* Delete Column (Removed Red Background) */}
                  <td className="p-2">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-gray-600 hover:text-red-500 text-lg"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Cart Totals */}
          <div className="mt-6 text-lg">
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

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => navigate(ROUTES.MENU)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
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
        </div>
      </div>

     
    </div>
  );
};

export default Cart;
