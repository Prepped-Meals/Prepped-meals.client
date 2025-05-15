import React, { useState } from 'react';
import { apiClient } from '../api/apiClient';
import { END_POINTS } from '../api/endPoints';

const UpdateMealPopup = ({ meal, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    mealName: meal.meal_name || '',
    mealPrice: meal.meal_price || '',
    mealCalories: meal.calorie_count || '',
    mealDescription: meal.meal_description || '',
    mealStock: meal.meal_stock || '',
    mealImage: null
  });

  const [errors, setErrors] = useState({
    mealName: '',
    mealPrice: '',
    mealCalories: '',
    mealDescription: '',
    mealStock: '',
    mealImage: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // Validation function (unchanged from original)
  const validateField = (name, value) => {
    switch (name) {
      case 'mealName':
        if (!value.trim()) return 'Meal name is required';
        if (value.length < 3) return 'Name must be at least 3 characters';
        break;
      case 'mealPrice':
        if (!value) return 'Price is required';
        if (isNaN(value)) return 'Must be a number';
        if (parseFloat(value) <= 0) return 'Must be greater than 0';
        break;
      case 'mealCalories':
        if (!value) return 'Calories is required';
        if (isNaN(value)) return 'Must be a number';
        if (parseInt(value) <= 0) return 'Must be greater than 0';
        break;
      case 'mealDescription':
        if (!value.trim()) return 'Description is required';
        if (value.length < 10) return 'Description too short';
        break;
      case 'mealStock':
        if (!value) return 'Stock is required';
        if (isNaN(value)) return 'Must be a number';
        if (parseInt(value) < 0) return 'Cannot be negative';
        break;
      case 'mealImage':
        if (value && value.size > 2 * 1024 * 1024) return 'Image must be <2MB';
        break;
      default:
        return '';
    }
    return '';
  };

  // Updated to validate immediately on change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Keep blur validation for UX
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Updated image handler for instant validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setErrors(prev => ({ ...prev, mealImage: 'Please select an image file' }));
        return;
      }
      const error = validateField('mealImage', file);
      setErrors(prev => ({ ...prev, mealImage: error }));
      setFormData(prev => ({ ...prev, mealImage: error ? null : file }));
    }
  };

  // Original submit logic (unchanged)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation check
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      newErrors[key] = validateField(key, formData[key]);
    });
    setErrors(newErrors);

    if (Object.values(newErrors).some(err => err)) return;

    const submitData = new FormData();
    submitData.append('meal_name', formData.mealName);
    submitData.append('meal_price', formData.mealPrice);
    submitData.append('calorie_count', formData.mealCalories);
    submitData.append('meal_description', formData.mealDescription);
    submitData.append('meal_stock', formData.mealStock);
    if (formData.mealImage) submitData.append('meal_image', formData.mealImage);

    try {
      await apiClient.put(`${END_POINTS.UPDATE_MEAL}/${meal.meal_id}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowSuccess(true);
    } catch (error) {
      console.error('Error updating meal:', error.response?.data || error.message);
      alert('Failed to update meal.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex justify-center items-center px-4">
      {showSuccess && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-xl w-72 text-center">
            <h2 className="text-lg font-semibold text-green-700 mb-4">Meal updated successfully!</h2>
            <button
              onClick={() => {
                setShowSuccess(false);
                onClose();
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>

        <div className="w-1/2 bg-gray-100 flex items-center justify-center p-4">
          <img
            src={formData.mealImage ? URL.createObjectURL(formData.mealImage) : meal.meal_image || 'https://via.placeholder.com/300'}
            alt={formData.mealName}
            className="rounded-xl max-h-[400px] object-cover"
          />
        </div>

        <div className="w-1/2 p-6 flex flex-col justify-between">
          <h2 className="text-2xl font-bold mb-2 text-green-700">UPDATE MEAL</h2>
          <p className="text-sm text-gray-500 mb-4">
            Meal ID: <span className="text-green-600 font-medium">{meal.meal_id}</span>
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Meal Name */}
            <div>
              <label className="text-sm font-medium text-gray-700">Meal Name</label>
              <input
                type="text"
                name="mealName"
                value={formData.mealName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`border ${errors.mealName ? 'border-red-500' : 'border-gray-300'} focus:border-green-600 focus:ring-green-500 p-2 rounded-md outline-none w-full`}
                required
              />
              {errors.mealName && <p className="text-red-500 text-xs mt-1">{errors.mealName}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                name="mealPrice"
                value={formData.mealPrice}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`border ${errors.mealPrice ? 'border-red-500' : 'border-gray-300'} focus:border-green-600 focus:ring-green-500 p-2 rounded-md outline-none w-full`}
                required
              />
              {errors.mealPrice && <p className="text-red-500 text-xs mt-1">{errors.mealPrice}</p>}
            </div>

            {/* Calories */}
            <div>
              <label className="text-sm font-medium text-gray-700">Calories</label>
              <input
                type="number"
                name="mealCalories"
                value={formData.mealCalories}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`border ${errors.mealCalories ? 'border-red-500' : 'border-gray-300'} focus:border-green-600 focus:ring-green-500 p-2 rounded-md outline-none w-full`}
                required
              />
              {errors.mealCalories && <p className="text-red-500 text-xs mt-1">{errors.mealCalories}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="mealDescription"
                value={formData.mealDescription}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`border ${errors.mealDescription ? 'border-red-500' : 'border-gray-300'} focus:border-green-600 focus:ring-green-500 p-2 rounded-md outline-none w-full`}
                rows="3"
                required
              />
              {errors.mealDescription && <p className="text-red-500 text-xs mt-1">{errors.mealDescription}</p>}
            </div>

            {/* Stock */}
            <div>
              <label className="text-sm font-medium text-gray-700">Meal Stock</label>
              <input
                type="number"
                name="mealStock"
                value={formData.mealStock}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`border ${errors.mealStock ? 'border-red-500' : 'border-gray-300'} focus:border-green-600 focus:ring-green-500 p-2 rounded-md outline-none w-full`}
                required
              />
              {errors.mealStock && <p className="text-red-500 text-xs mt-1">{errors.mealStock}</p>}
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700">Meal Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`p-1 text-sm w-full ${errors.mealImage ? 'border-red-500' : ''}`}
              />
              {errors.mealImage && <p className="text-red-500 text-xs mt-1">{errors.mealImage}</p>}
            </div>

            <button
              type="submit"
              disabled={Object.values(errors).some(err => err)}
              className={`bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition mt-2 ${
                Object.values(errors).some(err => err) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
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