import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Button from "../components/button";
import { ROUTES } from "../routes/paths";
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
  const [expandedMeal, setExpandedMeal] = useState(null);

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

  const toggleMealExpansion = (mealId) => {
    setExpandedMeal(expandedMeal === mealId ? null : mealId);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Culinary Selection</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nutritious frozen meals, perfectly portioned for your calorie goals - ready in minutes!
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-10 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search dishes..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <select
              value={calorieRange}
              onChange={handleCalorieRangeChange}
              className="block w-full md:w-48 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent rounded-lg text-sm"
            >
              <option value="all">All Calories</option>
              <option value="100-150">100 - 150 kcal</option>
              <option value="151-200">151 - 200 kcal</option>
              <option value="201-300">201 - 300 kcal</option>
              <option value="301-400">301 - 400 kcal</option>
              <option value="401">400+ kcal</option>
            </select>
          </div>
        </div>

        {/* Alert Popup for Stock Issues */}
        {alertMessage && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center">
              <p className="text-red-500 font-semibold mb-4">{alertMessage}</p>
              <button
                onClick={() => setAlertMessage("")}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
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
                  className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 text-sm"
                >
                  Log In
                </button>
                <button
                  onClick={() => setShowLoginPopup(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
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
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredMeals.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-700">
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
                className="mt-4 text-green-700 hover:text-green-800 font-medium text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMeals.map((meal) => {
              const isAdded = !!cartQuantities[meal._id];
              const isExpanded = expandedMeal === meal._id;
              
              return (
                <div
                  key={meal._id}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200 ${
                    isAdded ? "ring-1 ring-green-700" : ""
                  }`}
                >
                  {/* Meal Image */}
                  <div className="relative pt-[70%] overflow-hidden">
                    <img
                      src={`http://localhost:8000${meal.meal_image}`}
                      alt={meal.meal_name}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    {isAdded && (
                      <div className="absolute top-3 right-3 bg-green-700 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Added
                      </div>
                    )}
                  </div>

                  {/* Meal Details */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{meal.meal_name}</h3>
                      <div className="text-right">
                        <span className="text-green-700 font-bold block">Rs. {meal.meal_price.toFixed(2)}</span>
                        <span className="text-xs text-gray-500">(per 100g)</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {meal.calorie_count} kcal
                      </span>
                      <button
                        onClick={() => toggleMealExpansion(meal._id)}
                        className="text-xs text-green-700 hover:text-green-800 font-medium"
                      >
                        {isExpanded ? "Less details" : "More details"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mb-3">
                        <p className="text-gray-600 text-sm mb-2 whitespace-pre-line">{meal.meal_description}</p>
                        <div className="text-xs text-gray-500">
                          {/* <span>Available: {meal.meal_stock}</span> */}
                        </div>
                      </div>
                    )}

                    {isAdded ? (
                      <div className="flex items-center justify-between mt-4">
                        <button
                          onClick={() => handleAddToCart(meal, "decrease")}
                          className="text-gray-500 hover:text-green-700 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <span className="font-medium text-gray-900">{cartQuantities[meal._id]}</span>
                        <button
                          onClick={() => handleAddToCart(meal, "increase")}
                          className="text-gray-500 hover:text-green-700 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleAddToCart(meal, "increase")}
                        className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-4 rounded-lg text-sm transition duration-200 mt-2"
                      >
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <button
        onClick={() => navigate(ROUTES.CART)}
        className="fixed right-6 bottom-6 bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-5 rounded-full shadow-lg transition duration-200 flex items-center gap-2 z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
        <span className="hidden sm:inline">View Cart</span>
      </button>
    </div>
  );
};

export default Menu;