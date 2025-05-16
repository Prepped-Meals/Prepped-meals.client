import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import cartBg from "../assets/images/crt2.jpg";
import { CartContext } from "../context/cartContext";
import { useSaveCart } from "../hooks/useSaveCartDetails";
import { useDeleteCartDetails } from "../hooks/useDeleteCartDetails";
import { useAuth } from "../context/authContext";
import { apiClient } from "../api/apiClient";
import { END_POINTS } from "../api/endPoints";
import axios from "axios";

const Cart = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { updateCart, customer } = useContext(CartContext);

  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(user?.cart_id || null);
  const [loadingCartId, setLoadingCartId] = useState(!user?.cart_id);
  const [cartQuantities, setCartQuantities] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const [deletingMealId, setDeletingMealId] = useState(null); // Track meal being deleted

  const { mutate: saveCart, isLoading: savingCart } = useSaveCart();
  const { mutate: deleteCart, isLoading: deletingCart } = useDeleteCartDetails();

  const fetchCart = useCallback(
    async (customerId) => {
      try {
        console.log(`Fetching cart for customer_id: ${customerId}`);
        const response = await apiClient.get(END_POINTS.GET_CART_BY_CUSTOMER(customerId));
        console.log("Fetch cart response:", response.data);
        if (response.data.success && response.data.cart) {
          const newCartId = response.data.cart.cart_id;
          const cartItemsFromBackend = (response.data.cart.items || response.data.cart.meals || []).filter(
            (item) => item.quantity > 0
          );

          // Fetch meal details to get stock levels
          // eslint-disable-next-line
          const mealIds = cartItemsFromBackend.map(item => item.meal);
          const mealResponse = await axios.get(
            "http://localhost:8000/api/get-meals/get"
          );
          const meals = mealResponse.data.meals || [];
          const updatedCartItems = cartItemsFromBackend.map(item => {
            const meal = meals.find(m => m._id === item.meal);
            return {
              ...item,
              meal_stock: meal ? meal.meal_stock : 0,
            };
          });

          console.log("Cart Items with Stock:", updatedCartItems);
          setCartId(newCartId);
          setCartItems(updatedCartItems);

          const quantities = {};
          updatedCartItems.forEach((item) => {
            quantities[item.meal] = item.quantity;
          });
          setCartQuantities(quantities);

          localStorage.setItem("cart", JSON.stringify(updatedCartItems));
          setUser((prev) => ({ ...prev, cart_id: newCartId }));
          localStorage.setItem("user", JSON.stringify({ ...user, cart_id: newCartId }));
        } else {
          console.log("No cart data or success false, setting empty cart");
          setCartItems([]);
          setCartQuantities({});
          localStorage.setItem("cart", JSON.stringify([]));
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error, error.response?.data);
        setCartItems(JSON.parse(localStorage.getItem("cart")) || []);
        setCartQuantities({});
      } finally {
        console.log("Finished fetching cart, loadingCartId set to false");
        setLoadingCartId(false);
      }
    },
    [setUser, user]
  );

  useEffect(() => {
    if (!user) {
      console.log("No user, redirecting to login");
      navigate(ROUTES.LOGIN);
    } else if (user._id) {
      fetchCart(user._id);
    } else {
      console.log("No user._id, using localStorage");
      setCartItems(JSON.parse(localStorage.getItem("cart")) || []);
      setCartQuantities({});
      setLoadingCartId(false);
    }
  }, [user, fetchCart, navigate]);

  const handleIncrease = (item) => {
    const mealStock = item.meal_stock || 0;
    if (cartQuantities[item.meal] >= mealStock) {
      setAlertMessage(`Cannot add more of ${item.meal_name}. Not enough stock.`);
      return;
    }

    const existingCart = [...cartItems];
    const existingIndex = existingCart.findIndex((i) => i.meal === item.meal);

    if (existingIndex !== -1) {
      existingCart[existingIndex].quantity += 1;
      existingCart[existingIndex].total_price =
        existingCart[existingIndex].meal_price * existingCart[existingIndex].quantity;
    } else {
      existingCart.push({
        meal: item.meal,
        meal_name: item.meal_name,
        meal_price: item.meal_price,
        meal_stock: item.meal_stock,
        quantity: 1,
        total_price: item.meal_price,
      });
    }

    setCartItems(existingCart);
    localStorage.setItem("cart", JSON.stringify(existingCart));

    setCartQuantities((prev) => ({
      ...prev,
      [item.meal]: (prev[item.meal] || 0) + 1,
    }));

    saveCart(
      {
        customer: user._id,
        meal: item.meal,
        meal_name: item.meal_name,
        meal_price: item.meal_price,
        action: "increase",
      },
      {
        onError: (error) => {
          console.error("Failed to save cart (increase):", error);
          setAlertMessage(`Failed to update ${item.meal_name} quantity.`);
          fetchCart(user._id);
        },
      }
    );
  };

  const handleDecrease = (item) => {
    console.log("Decrease called for meal:", item.meal, "Current quantity:", cartQuantities[item.meal]);
    const existingCart = [...cartItems];
    const existingIndex = existingCart.findIndex((i) => i.meal === item.meal);

    if (existingIndex !== -1) {
      const currentQuantity = existingCart[existingIndex].quantity;
      if (currentQuantity > 1) {
        existingCart[existingIndex].quantity -= 1;
        existingCart[existingIndex].total_price =
          existingCart[existingIndex].meal_price * existingCart[existingIndex].quantity;

        setCartItems(existingCart);
        localStorage.setItem("cart", JSON.stringify(existingCart));

        setCartQuantities((prev) => ({
          ...prev,
          [item.meal]: prev[item.meal] - 1,
        }));

        saveCart(
          {
            customer: user._id,
            meal: item.meal,
            meal_name: item.meal_name,
            meal_price: item.meal_price,
            action: "decrease",
          },
          {
            onSuccess: () => {
              console.log(`Successfully decreased quantity for ${item.meal_name}`);
            },
            onError: (error) => {
              console.error("Failed to save cart (decrease):", error);
              setAlertMessage(`Failed to update ${item.meal_name} quantity.`);
              fetchCart(user._id);
            },
          }
        );
      } else {
        // Quantity is 1, do nothing (button should be disabled)
        console.log(`Cannot decrease ${item.meal_name} below 1. Use the delete button to remove.`);
        //setAlertMessage(`Cannot decrease ${item.meal_name} below 1. Use the delete button to remove.`);
      }
    } else {
      console.warn(`Meal ${item.meal} not found in cart`);
      setAlertMessage(`Meal ${item.meal_name} not found in cart.`);
    }
  };

  const handleRemove = (meal_id) => {
    if (!cartId) {
      setAlertMessage("Cart ID not available. Please try again.");
      return;
    }

    console.log("Removing meal:", meal_id, "Current cartItems:", cartItems, "Current cartQuantities:", cartQuantities);
    const isLastMeal = cartItems.length === 1 && cartItems[0].meal === meal_id;

    // Immediately update local state
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.meal !== meal_id);
      console.log("After remove - cartItems:", newItems);
      return newItems;
    });
    setCartQuantities((prev) => {
      const updated = { ...prev };
      delete updated[meal_id];
      console.log("After remove - cartQuantities:", updated);
      return updated;
    });

    // Update localStorage immediately
    const updatedCart = cartItems.filter((item) => item.meal !== meal_id);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Track the meal being deleted to disable its button
    setDeletingMealId(meal_id);

    deleteCart(
      { cart_id: cartId, meal_id },
      {
        onSuccess: (response) => {
          console.log("Meal deleted successfully, response:", response.data);
          if (isLastMeal) {
            console.log("Last meal deleted, forcing empty cart state");
            setCartItems([]);
            setCartQuantities({});
            setCartId(null); // Reset cartId as cart is empty
            localStorage.setItem("cart", JSON.stringify([]));
            setUser((prev) => ({ ...prev, cart_id: null }));
            localStorage.setItem("user", JSON.stringify({ ...user, cart_id: null }));
          } else {
            // Only fetch cart if there are remaining items
            fetchCart(user._id);
          }
        },
        onError: (error) => {
          console.error("Delete error:", error, error.response?.data);
          if (error.response?.status === 404) {
            console.log("404: Meal or cart not found, treating as success");
            if (isLastMeal) {
              setCartItems([]);
              setCartQuantities({});
              setCartId(null);
              localStorage.setItem("cart", JSON.stringify([]));
              setUser((prev) => ({ ...prev, cart_id: null }));
              localStorage.setItem("user", JSON.stringify({ ...user, cart_id: null }));
            } else {
              fetchCart(user._id);
            }
          } else {
            setAlertMessage("Failed to remove meal from cart. Please try again.");
            fetchCart(user._id);
          }
        },
        onSettled: () => {
          // Clear deleting state after operation
          setDeletingMealId(null);
        },
      }
    );
  };

  useEffect(() => {
    console.log("Updating localStorage with cartItems:", cartItems);
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
    return (
      <div className="text-center py-10">
        <svg
          className="animate-spin h-8 w-8 text-green-600 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
          ></path>
        </svg>
        <p className="mt-2 text-lg">Loading cart information...</p>
      </div>
    );
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

      {alertMessage && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
            <p className="text-red-500 font-semibold mb-4">{alertMessage}</p>
            <button
              onClick={() => setAlertMessage("")}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center flex-grow p-6 relative z-10">
        <h1 className="text-3xl font-bold mb-6 text-black">Your Cart</h1>

        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl opacity-90">
          {cartItems.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl font-semibold text-gray-700">Your cart is empty.</p>
              <p className="text-gray-500 mt-2">Add some delicious meals to get started!</p>
              <button
                onClick={() => navigate(ROUTES.MENU)}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
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
                      <td className="p-2">{item.meal_name || "Unknown Meal"}</td>
                      <td className="p-2">
                        Rs: {item.meal_price?.toFixed(2) || "0.00"}
                      </td>
                      <td className="p-2 text-center">
                        {cartQuantities[item.meal] || 1}
                      </td>
                      <td className="p-2">
                        Rs: {item.total_price?.toFixed(2) || "0.00"}
                      </td>
                      <td className="p-2 flex items-center space-x-4 justify-center">
                        <button
                          onClick={() => handleDecrease(item)}
                          className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-full

 text-xl"
                          disabled={savingCart || deletingCart}
                        >
                          -
                        </button>
                        <span className="font-semibold text-lg">
                          {cartQuantities[item.meal] || 1}
                        </span>
                        <button
                          onClick={() => handleIncrease(item)}
                          className="bg-green-400 hover:bg-green-500 text-white px-3 py-1 rounded-full text-xl"
                          disabled={savingCart || deletingCart}
                        >
                          +
                        </button>
                      </td>
                      <td className="p-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Dustbin button clicked for meal:", item.meal);
                            handleRemove(item.meal);
                          }}
                          className="text-gray-600 hover:text-red-500 active:bg-red-100 text-lg"
                          disabled={savingCart || deletingCart || !cartId || deletingMealId === item.meal}
                          title="Delete this meal"
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
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  disabled={savingCart || deletingCart}
                >
                  Add more Meals
                </button>
                <button
                  onClick={() => navigate(ROUTES.PAYMENT)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  disabled={savingCart || deletingCart}
                >
                  Proceed To Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;