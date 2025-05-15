import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import cartBg from "../assets/images/crt2.jpg";
import { CartContext } from "../context/cartContext";
import { useSaveCart } from "../hooks/useSaveCartDetails";
import { useDeleteCartDetails } from "../hooks/useDeleteCartDetails";
import { useAuth } from "../context/authContext";
import { apiClient } from "../api/apiClient";
import { END_POINTS } from "../api/endPoints";

const Cart = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth(); // Get setUser from useAuth
  const { updateCart, customer } = useContext(CartContext);

  const [cartItems, setCartItems] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );
  const [cartId, setCartId] = useState(user?.cart_id || null);
  const [loadingCartId, setLoadingCartId] = useState(!user?.cart_id);

  const { mutate: saveCart, isLoading: savingCart } = useSaveCart();
  const { mutate: deleteCart, isLoading: deletingCart } = useDeleteCartDetails();

  // Fetch cart_id if not available
  useEffect(() => {
    const fetchCartId = async () => {
      if (!user?.cart_id && user?._id) {
        try {
          console.log(`Fetching cart for customer_id: ${user._id}`);
          const response = await apiClient.get(END_POINTS.GET_CART_BY_CUSTOMER(user._id));
          if (response.data.success && response.data.cart) {
            const newCartId = response.data.cart.cart_id;
            setCartId(newCartId);
            setUser((prev) => ({ ...prev, cart_id: newCartId }));
            localStorage.setItem("user", JSON.stringify({ ...user, cart_id: newCartId }));
          }
        } catch (error) {
          console.error("Failed to fetch cart:", error);
        } finally {
          setLoadingCartId(false);
        }
      } else {
        setCartId(user?.cart_id || null);
        setLoadingCartId(false);
      }
    };

    fetchCartId();
  }, [user, setUser]);

  const handleIncrease = (item) => {
    setCartItems((prevItems) =>
      prevItems.map((i) =>
        i.meal === item.meal
          ? {
              ...i,
              quantity: i.quantity + 1,
              total_price: i.meal_price * (i.quantity + 1),
            }
          : i
      )
    );

    saveCart({
      customer: user._id,
      meal: item.meal,
      meal_name: item.meal_name,
      meal_price: item.meal_price,
      action: "increase",
    });
  };

  const handleDecrease = (item) => {
    setCartItems((prevItems) =>
      prevItems.map((i) =>
        i.meal === item.meal && i.quantity > 1
          ? {
              ...i,
              quantity: i.quantity - 1,
              total_price: i.meal_price * (i.quantity - 1),
            }
          : i
      )
    );

    if (item.quantity > 1) {
      saveCart({
        customer: user._id,
        meal: item.meal,
        meal_name: item.meal_name,
        meal_price: item.meal_price,
        action: "decrease",
      });
    }
  };

  const handleRemove = (meal_id) => {
    if (!cartId) {
      alert("Cart ID not available. Please try again.");
      return;
    }

    const prevItems = [...cartItems];
    setCartItems((prevItems) => prevItems.filter((item) => item.meal !== meal_id));

    console.log(`Calling deleteCart with cart_id: ${cartId}, meal_id: ${meal_id}`);
    deleteCart(
      { cart_id: cartId, meal_id },
      {
        onSuccess: () => {
          alert("Meal removed from cart successfully!");
        },
        onError: (error) => {
          console.error("Delete error:", error);
          alert("Failed to remove meal from cart. Please try again.");
          setCartItems(prevItems);
        },
      }
    );
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

  if (customer === null || loadingCartId) {
    return <div>Loading cart information...</div>;
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
                      onClick={() => handleIncrease(item)}
                      className="px-2 py-1 bg-gray-300 rounded text-lg font-bold"
                      disabled={savingCart}
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleDecrease(item)}
                      className="px-2 py-1 bg-gray-300 rounded text-lg font-bold"
                      disabled={savingCart}
                    >
                      -
                    </button>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        console.log("Dustbin button clicked for meal:", item.meal);
                        handleRemove(item.meal);
                      }}
                      className="text-gray-600 hover:text-red-500 text-lg"
                      disabled={deletingCart || !cartId}
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

          {cartItems.length > 0 && (
            <div className="flex justify-between mt-6">
              <button
                onClick={() => navigate(ROUTES.MENU)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Add more Meals
              </button>
              <button
                onClick={() => navigate(ROUTES.PAYMENT)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Proceed To Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;