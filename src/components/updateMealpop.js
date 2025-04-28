import React, { useState } from 'react';
import { apiClient } from '../api/apiClient';
import { END_POINTS } from '../api/endPoints';

const UpdateMealPopup = ({ meal, onClose, onSubmit }) => {
  const [mealName, setMealName] = useState(meal.meal_name || '');
  const [mealPrice, setMealPrice] = useState(meal.meal_price || '');
  const [mealCalories, setMealCalories] = useState(meal.calorie_count || '');
  const [mealDescription, setMealDescription] = useState(meal.meal_description || '');
  const [mealStock, setMealStock] = useState(meal.meal_stock || '');
  const [mealImage, setMealImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations for negative numbers
    if (parseFloat(mealPrice) < 0) {
      alert("Meal price cannot be less than 0.");
      return;
    }
    if (parseInt(mealCalories) < 0) {
      alert("Calories cannot be less than 0.");
      return;
    }
    if (parseInt(mealStock) < 0) {
      alert("Stock cannot be less than 0.");
      return;
    }

    const formData = new FormData();
    formData.append('meal_name', mealName);
    formData.append('meal_price', mealPrice);
    formData.append('calorie_count', mealCalories);
    formData.append('meal_description', mealDescription);
    formData.append('meal_stock', mealStock);
    if (mealImage) {
      formData.append('meal_image', mealImage);
    }

    try {
      await apiClient.put(`${END_POINTS.UPDATE_MEAL}/${meal.meal_id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Meal updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating meal:', error.response ? error.response.data : error.message);
      alert('Failed to update meal.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>

        {/* Left: Meal Image */}
        <div className="w-1/2 bg-gray-100 flex items-center justify-center p-4">
          <img
            src={mealImage ? URL.createObjectURL(mealImage) : meal.meal_image || 'https://via.placeholder.com/300'}
            alt={mealName}
            className="rounded-xl max-h-[400px] object-cover"
          />
        </div>

        {/* Right: Update Form */}
        <div className="w-1/2 p-6 flex flex-col justify-between">
          <h2 className="text-2xl font-bold mb-2 text-green-700">UPDATE MEAL</h2>
          <p className="text-sm text-gray-500 mb-4">Meal ID: <span className="text-green-600 font-medium">{meal.meal_id}</span></p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700">Meal Name</label>
            <input
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="border border-green-500 focus:border-green-600 focus:ring-green-500 focus:outline-none focus:ring-1 p-2 rounded-md"
              required
            />

            <label className="text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              value={mealPrice}
              onChange={(e) => setMealPrice(e.target.value)}
              className="border border-green-500 focus:border-green-600 focus:ring-green-500 focus:outline-none focus:ring-1 p-2 rounded-md"
              required
            />

            <label className="text-sm font-medium text-gray-700">Calories</label>
            <input
              type="number"
              value={mealCalories}
              onChange={(e) => setMealCalories(e.target.value)}
              className="border border-green-500 focus:border-green-600 focus:ring-green-500 focus:outline-none focus:ring-1 p-2 rounded-md"
              required
            />

            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={mealDescription}
              onChange={(e) => setMealDescription(e.target.value)}
              className="border border-green-500 focus:border-green-600 focus:ring-green-500 focus:outline-none focus:ring-1 p-2 rounded-md"
              rows="3"
              required
            />

            <label className="text-sm font-medium text-gray-700">Meal Stock</label>
            <input
              type="number"
              value={mealStock}
              onChange={(e) => setMealStock(e.target.value)}
              className="border border-green-500 focus:border-green-600 focus:ring-green-500 focus:outline-none focus:ring-1 p-2 rounded-md"
              required
            />

            <label className="text-sm font-medium text-gray-700">Meal Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setMealImage(e.target.files[0])}
              className="p-1 text-sm"
            />

            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 mt-2"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateMealPopup;
