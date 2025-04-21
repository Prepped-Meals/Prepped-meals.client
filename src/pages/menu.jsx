import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Button from "../components/button";
import { ROUTES } from "../routes/paths";

const Menu = () => {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/get-meals/get");
        console.log("API Response:", response.data); // Log the entire response

        if (response.data && response.data.meals && Array.isArray(response.data.meals) && response.data.meals.length > 0) {
          // Check if response.data and response.data.meals exist and are an array
          setMeals(response.data.meals);
        } else if (response.data && response.data.meals && Array.isArray(response.data.meals) && response.data.meals.length === 0) {
          setMeals([]); // Set an empty array if no meals are returned
        }
         else {
          // Handle unexpected response format or empty data appropriately
          setError("Unexpected data format from the server.");
          console.error("Unexpected data format:", response.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching meals:", error);
        setError("Failed to load meals. Please try again later.");
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  const handleAddToCart = () => {
    console.log("Navigating to Cart Page...");
    navigate(ROUTES.CART);
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen py-10">
      <h1 className="text-4xl font-bold mb-8">Menu Page</h1>

      {loading ? (
        <p className="text-lg">Loading meals...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : meals.length === 0 ? (
        <p className="text-lg">No meals available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((meal) => (
            <div
              key={meal._id}
              className="bg-white p-6 rounded-xl shadow-md w-80 text-center"
            >
              <h2 className="text-2xl font-semibold mb-2">{meal.meal_name}</h2>
              <p className="text-gray-700 mb-2">{meal.meal_description}</p>
              <p className="text-sm text-gray-500 mb-1">
                Calories: {meal.calorie_count}
              </p>
              <p className="font-bold text-lg mb-4">Rs. {meal.meal_price}</p>
              <Button onClick={handleAddToCart}>Add to Cart</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;