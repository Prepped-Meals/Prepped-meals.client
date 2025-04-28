import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Button from "../components/button";
import { ROUTES } from "../routes/paths";
import bgImage from "../assets/images/green-wall-texture.jpg"; // Background image

const Menu = () => {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartQuantities, setCartQuantities] = useState({});
  const [alertMessage, setAlertMessage] = useState(""); // To show alert for stock issues

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/get-meals/get"
        );
        if (
          response.data &&
          response.data.meals &&
          Array.isArray(response.data.meals)
        ) {
          setMeals(response.data.meals);
        } else {
          setError("Unexpected data format from the server.");
          console.error("Unexpected data format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching meals:", error);
        setError("Failed to load meals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();

    // Load quantities from localStorage on initial load
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const quantities = {};
    existingCart.forEach((item) => {
      quantities[item.meal] = item.quantity;
    });
    setCartQuantities(quantities);
  }, []);

  const handleAddToCart = (meal) => {
    if (meal.meal_stock <= 0) {
      setAlertMessage(`Sorry, ${meal.meal_name} is out of stock.`);
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = existingCart.findIndex(
      (item) => item.meal === meal._id
    );

    if (existingIndex !== -1) {
      if (existingCart[existingIndex].quantity < meal.meal_stock) {
        existingCart[existingIndex].quantity += 1;
        existingCart[existingIndex].total_price =
          existingCart[existingIndex].meal_price *
          existingCart[existingIndex].quantity;
      } else {
        setAlertMessage(`Cannot add more of ${meal.meal_name}. Not enough stock.`);
        return;
      }
    } else {
      existingCart.push({
        meal: meal._id,
        meal_name: meal.meal_name,
        meal_price: meal.meal_price,
        quantity: 1,
        total_price: meal.meal_price,
      });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));

    // Update local quantity
    setCartQuantities((prev) => ({
      ...prev,
      [meal._id]: (prev[meal._id] || 0) + 1,
    }));
  };

  const handleIncrease = (meal) => {
    handleAddToCart(meal);
  };

  const handleDecrease = (meal) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = existingCart.findIndex(
      (item) => item.meal === meal._id
    );

    if (existingIndex !== -1) {
      if (existingCart[existingIndex].quantity > 1) {
        existingCart[existingIndex].quantity -= 1;
        existingCart[existingIndex].total_price =
          existingCart[existingIndex].meal_price *
          existingCart[existingIndex].quantity;
      } else {
        existingCart.splice(existingIndex, 1);
      }
      localStorage.setItem("cart", JSON.stringify(existingCart));
    }

    // Update local quantity
    setCartQuantities((prev) => {
      const updated = { ...prev };
      if (updated[meal._id] > 1) {
        updated[meal._id] -= 1;
      } else {
        delete updated[meal._id];
      }
      return updated;
    });
  };

  return (
    <div
      className="flex flex-col items-center min-h-screen py-10 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <h1 className="text-4xl font-extrabold text-black mb-8">Menu Page</h1>

      {/* Alert Popup for Stock Issues */}
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

      {loading ? (
        <p className="text-lg text-white">Loading meals...</p>
      ) : error ? (
        <p className="text-red-300">{error}</p>
      ) : meals.length === 0 ? (
        <p className="text-lg text-white">No meals available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {meals.map((meal) => {
            const isAdded = !!cartQuantities[meal._id];
            return (
              <div
                key={meal._id}
                className={`relative bg-white p-6 rounded-2xl shadow-md w-80 text-center transition-all duration-300 ${
                  isAdded ? "bg-green-100 border-2 border-green-400" : ""
                }`}
              >
                {/* Added to Cart Badge */}
                {isAdded && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Added to Cart
                  </div>
                )}

                <img
                  src={`http://localhost:8000${meal.meal_image}`}
                  alt={meal.meal_name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />

                <h2 className="text-2xl font-semibold mb-2">{meal.meal_name}</h2>
                <p className="text-gray-700 mb-2">{meal.meal_description}</p>
                <p className="text-sm text-gray-500 mb-1">
                  Calories: {meal.calorie_count}
                </p>
                <p className="font-bold text-lg mb-4">Rs. {meal.meal_price}</p>

                {isAdded ? (
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <button
                      onClick={() => handleDecrease(meal)}
                      className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-full text-xl"
                    >
                      -
                    </button>
                    <span className="font-semibold text-lg">
                      {cartQuantities[meal._id]}
                    </span>
                    <button
                      onClick={() => handleIncrease(meal)}
                      className="bg-green-400 hover:bg-green-500 text-white px-3 py-1 rounded-full text-xl"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleAddToCart(meal)}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                  >
                    Add to Cart
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Go To Cart Button */}
      <Button
        onClick={() => navigate(ROUTES.CART)}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 mt-8 rounded-md transition duration-300 absolute right-4 bottom-4"
      >
        Go to Cart
      </Button>
    </div>
  );
};

export default Menu;
