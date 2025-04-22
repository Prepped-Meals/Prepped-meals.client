import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Button from "../components/button";
import { ROUTES } from "../routes/paths";
import bgImage from "../assets/images/batch-cooking.jpg"; // Background image

const Menu = () => {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/get-meals/get");
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
  }, []);

  const handleAddToCart = (meal) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingIndex = existingCart.findIndex((item) => item.meal === meal._id);

    if (existingIndex !== -1) {
      // Update quantity and total price
      existingCart[existingIndex].quantity += 1;
      existingCart[existingIndex].total_price =
        existingCart[existingIndex].meal_price * existingCart[existingIndex].quantity;
    } else {
      // Add new item
      existingCart.push({
        meal: meal._id,
        meal_name: meal.meal_name,
        meal_price: meal.meal_price,
        quantity: 1,
        total_price: meal.meal_price,
      });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));

    // Navigate to cart page
    navigate(ROUTES.CART);
  };

  return (
    <div
      className="flex flex-col items-center min-h-screen py-10 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <h1 className="text-4xl font-extrabold text-black mb-8">Menu Page</h1>

      {loading ? (
        <p className="text-lg text-white">Loading meals...</p>
      ) : error ? (
        <p className="text-red-300">{error}</p>
      ) : meals.length === 0 ? (
        <p className="text-lg text-white">No meals available at the moment.</p>
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
              <Button onClick={() => handleAddToCart(meal)}>Add to Cart</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;
