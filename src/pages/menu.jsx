import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Button from "../components/button";
import { ROUTES } from "../routes/paths";
import bgImage from "../assets/images/green-wall-texture.jpg";
import { useAuth } from "../context/authContext";
import { useSaveCart } from "../hooks/useSaveCartDetails";

const Menu = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meals, setMeals] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartQuantities, setCartQuantities] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNumberPopup, setShowNumberPopup] = useState(false);
  const [calorieRange, setCalorieRange] = useState("all");

  // eslint-disable-next-line
  const { mutate: saveCart, isLoading: savingCart } = useSaveCart();

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
          setFilteredMeals(response.data.meals);
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

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const quantities = {};
    existingCart.forEach((item) => {
      quantities[item.meal] = item.quantity;
    });
    setCartQuantities(quantities);
  }, []);

  // Filter meals based on meal name and calorie range
  useEffect(() => {
    let filtered = meals;

    // Filter by search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((meal) =>
        meal.meal_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by calorie range
    if (calorieRange !== "all") {
      const [min, max] = calorieRange.split("-").map(Number);
      filtered = filtered.filter((meal) => {
        if (max) {
          return meal.calorie_count >= min && meal.calorie_count <= max;
        }
        return meal.calorie_count >= min;
      });
    }

    setFilteredMeals(filtered);
  }, [searchTerm, calorieRange, meals]);

  // Handle search input change with number restriction
  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (/[0-9]/.test(value)) {
      setShowNumberPopup(true);
      return;
    }
    setSearchTerm(value);
  };

  // Handle calorie range change
  const handleCalorieRangeChange = (e) => {
    setCalorieRange(e.target.value);
  };

  const handleAddToCart = (meal, action) => {
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    if (action === "increase" && meal.meal_stock <= 0) {
      setAlertMessage(`Sorry, ${meal.meal_name} is out of stock.`);
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = existingCart.findIndex(
      (item) => item.meal === meal._id
    );

    if (existingIndex !== -1) {
      if (action === "increase") {
        if (existingCart[existingIndex].quantity < meal.meal_stock) {
          existingCart[existingIndex].quantity += 1;
        } else {
          setAlertMessage(
            `Cannot add more of ${meal.meal_name}. Not enough stock.`
          );
          return;
        }
      } else if (action === "decrease") {
        if (existingCart[existingIndex].quantity > 1) {
          existingCart[existingIndex].quantity -= 1;
        } else {
          existingCart.splice(existingIndex, 1);
        }
      }

      if (existingCart[existingIndex]) {
        existingCart[existingIndex].total_price =
          existingCart[existingIndex].meal_price *
          existingCart[existingIndex].quantity;
      }
    } else if (action === "increase") {
      existingCart.push({
        meal: meal._id,
        meal_name: meal.meal_name,
        meal_price: meal.meal_price,
        quantity: 1,
        total_price: meal.meal_price,
      });
    } else {
      return;
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));

    setCartQuantities((prev) => {
      const newQuantity =
        (prev[meal._id] || 0) + (action === "increase" ? 1 : -1);
      if (newQuantity > 0) {
        return { ...prev, [meal._id]: newQuantity };
      } else {
        const updated = { ...prev };
        delete updated[meal._id];
        return updated;
      }
    });

    saveCart({
      customer: user._id,
      meal: meal._id,
      meal_name: meal.meal_name,
      meal_price: meal.meal_price,
      action,
    });
  };

  return (
    <div
      className="flex flex-col items-center min-h-screen py-10 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <h1 className="text-4xl font-extrabold text-black mb-8">Menu Page</h1>

      {/* Search Bar and Calorie Filter */}
      <div className="mb-8 w-full max-w-3xl px-4 flex flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0a7 7 0 10-9.9-9.9 7 7 0 009.9 9.9z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by meal name..."
            className="w-full py-3 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Calorie Range Dropdown */}
        <select
          value={calorieRange}
          onChange={handleCalorieRangeChange}
          className="w-48 py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All</option>
              <option value="100-150">100 - 150 kcal / 100g</option>
              <option value="151-200">151 - 200 kcal / 100g</option>
              <option value="201-300">201 - 300 kcal / 100g</option>
              <option value="301-400">301 - 400 kcal / 100g</option>
              <option value="401">Above 400 kcal / 100g</option>

        </select>
      </div>

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

      {/* Login Required Popup */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
            <p className="text-red-500 font-semibold mb-4">
              You must log in to add items to the cart.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate(ROUTES.SIGN_IN)}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Log In
              </button>
              <button
                onClick={() => setShowLoginPopup(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Number Not Allowed Popup */}
      {showNumberPopup && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
            <p className="text-red-500 font-semibold mb-4">
              Numbers are not allowed in the search.
            </p>
            <button
              onClick={() => setShowNumberPopup(false)}
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
      ) : filteredMeals.length === 0 ? (
        <div className="text-center">
          <p className="text-lg text-white">
            {searchTerm || calorieRange !== "all"
              ? `No meals found matching your criteria`
              : "No meals available at the moment."}
          </p>
          {(searchTerm || calorieRange !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCalorieRange("all");
              }}
              className="mt-4 text-white underline hover:text-green-200"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMeals.map((meal) => {
            const isAdded = !!cartQuantities[meal._id];
            return (
              <div
                key={meal._id}
                className={`relative bg-white p-6 rounded-2xl shadow-md w-80 text-center transition-all duration-300 ${
                  isAdded ? "bg-green-100 border-2 border-green-400" : ""
                }`}
              >
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
                      onClick={() => handleAddToCart(meal, "decrease")}
                      className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-full text-xl"
                    >
                      -
                    </button>
                    <span className="font-semibold text-lg">
                      {cartQuantities[meal._id]}
                    </span>
                    <button
                      onClick={() => handleAddToCart(meal, "increase")}
                      className="bg-green-400 hover:bg-green-500 text-white px-3 py-1 rounded-full text-xl"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleAddToCart(meal, "increase")}
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