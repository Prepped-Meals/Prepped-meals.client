import React, { useState } from 'react';
import mealbg from "../assets/meal1.png";
import { useSaveMeal } from '../hooks/useSaveMeal';

const AddMeals = () => {
  const [formData, setFormData] = useState({
    meal_name: '',
    meal_description: '',
    meal_price: '',
    calorie_count: '',
    admin: '',
    meal_image: null,
    meal_stock: '',
  });

  const [errors, setErrors] = useState({
    meal_name: '',
    meal_description: '',
    meal_price: '',
    calorie_count: '',
    admin: '',
    meal_image: '',
    meal_stock: '',
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { mutateAsync: saveMeal } = useSaveMeal();

  // Validation function
  const validateField = (name, value) => {
    switch (name) {
      case 'meal_name':
        if (!value.trim()) return 'Meal name is required';
        if (value.length < 3) return 'Name must be at least 3 characters';
        break;
      case 'meal_description':
        if (!value.trim()) return 'Description is required';
        if (value.length < 10) return 'Description too short (min 10 chars)';
        break;
      case 'meal_price':
        if (!value) return 'Price is required';
        if (isNaN(value)) return 'Must be a number';
        if (parseFloat(value) <= 0) return 'Must be greater than 0';
        break;
      case 'calorie_count':
        if (!value) return 'Calories is required';
        if (isNaN(value)) return 'Must be a number';
        if (parseInt(value) <= 0) return 'Must be greater than 0';
        break;
      case 'admin':
        if (!value.trim()) return 'Admin is required';
        break;
      case 'meal_stock':
        if (!value) return 'Stock is required';
        if (isNaN(value)) return 'Must be a number';
        if (parseInt(value) < 0) return 'Cannot be negative';
        if (parseInt(value) < 1) return 'Enter value more than 0';
        break;
      case 'meal_image':
        if (!value) return 'Image is required';
        break;
      default:
        return '';
    }
    return '';
  };

  //handles change in input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value })); //Handle form state immediately
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateField('meal_image', file);
      setErrors(prev => ({ ...prev, meal_image: error }));
      setFormData(prev => ({ ...prev, meal_image: error ? null : file }));
      setImagePreview(error ? null : URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation check
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      newErrors[key] = validateField(key, formData[key]);
    });
    setErrors(newErrors);

    if (Object.values(newErrors).some(err => err)) return;

    const submissionData = new FormData();
    submissionData.append("meal_name", formData.meal_name);
    submissionData.append("meal_description", formData.meal_description);
    submissionData.append("meal_price", formData.meal_price);
    submissionData.append("calorie_count", formData.calorie_count);
    submissionData.append("admin", formData.admin);
    submissionData.append("meal_stock", formData.meal_stock);

    if (formData.meal_image) {
      submissionData.append("meal_image", formData.meal_image);
    }

    try {
      await saveMeal(submissionData);
      setShowSuccessModal(true);
      setFormData({
        meal_name: '',
        meal_description: '',
        meal_price: '',
        calorie_count: '',
        admin: '',
        meal_stock: '',
        meal_image: null,
      });
      setImagePreview(null);
      setErrors({
        meal_name: '',
        meal_description: '',
        meal_price: '',
        calorie_count: '',
        admin: '',
        meal_image: '',
        meal_stock: '',
      });
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="h-screen w-full bg-cover bg-center" style={{ backgroundImage: `url(${mealbg})` }}>
      <div className="flex justify-center items-center h-full">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-[800px]">
          <h2 className="text-2xl font-bold mb-6 text-center">ADD MEALS</h2>

          {/* Grid layout for fields */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-4">
            <div>
              <label className="block mb-1 font-semibold">Meal Name</label>
              <input
                type="text"
                name="meal_name"
                className={`w-full p-2 border-2 rounded-lg ${errors.meal_name ? 'border-red-500' : 'border-green-500'}`}
                placeholder="Enter meal name"
                value={formData.meal_name}
                onChange={handleChange}
              />
              {errors.meal_name && <p className="text-red-500 text-xs mt-1">{errors.meal_name}</p>}
            </div>

            <div>
              <label className="block mb-1 font-semibold">Description</label>
              <textarea
                type="text"
                name="meal_description"
                className={`w-full p-2 border-2 rounded-lg ${errors.meal_description ? 'border-red-500' : 'border-green-500'} whitespace-pre-line`}
                placeholder="Enter description"
                value={formData.meal_description}
                onChange={handleChange}
              />
              {errors.meal_description && <p className="text-red-500 text-xs mt-1">{errors.meal_description}</p>}
            </div>

            <div>
              <label className="block mb-1 font-semibold">Price</label>
              <div className={`flex items-center border-2 rounded-lg ${errors.meal_price ? 'border-red-500' : 'border-green-500'} overflow-hidden`}>
                <span className="px-5 py-4 bg-green-500 text-white font-semibold">Rs.</span>
                <input
                  type="number"
                  name="meal_price"
                  className="w-full p-2 outline-none"
                  placeholder="Enter price"
                  value={formData.meal_price}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              {errors.meal_price && <p className="text-red-500 text-xs mt-1">{errors.meal_price}</p>}
            </div>

            <div>
              <label className="block mb-1 font-semibold">Calories</label>
              <div className={`flex items-center border-2 rounded-lg ${errors.calorie_count ? 'border-red-500' : 'border-green-500'} overflow-hidden`}>
                <input
                  type="number"
                  name="calorie_count"
                  className="w-full p-2 outline-none"
                  placeholder="Enter calories"
                  value={formData.calorie_count}
                  onChange={handleChange}
                  min="0"
                  step="1"
                />
                <span className="px-3 py-4 bg-green-500 text-white font-semibold">Kcal</span>
              </div>
              {errors.calorie_count && <p className="text-red-500 text-xs mt-1">{errors.calorie_count}</p>}
            </div>

            <div>
              <label className="block mb-1 font-semibold">Admin</label>
              <input
                type="text"
                name="admin"
                className={`w-full p-2 border-2 rounded-lg ${errors.admin ? 'border-red-500' : 'border-green-500'}`}
                placeholder="Enter admin"
                value={formData.admin}
                onChange={handleChange}
              />
              {errors.admin && <p className="text-red-500 text-xs mt-1">{errors.admin}</p>}
            </div>

            <div>
              <label className="block mb-1 font-semibold">Meal Stock</label>
              <input
                type="number"
                name="meal_stock"
                className={`w-full p-2 border-2 rounded-lg ${errors.meal_stock ? 'border-red-500' : 'border-green-500'}`}
                placeholder="Enter stock quantity"
                value={formData.meal_stock}
                onChange={handleChange}
                min="0"
              />
              {errors.meal_stock && <p className="text-red-500 text-xs mt-1">{errors.meal_stock}</p>}
            </div>
          </div>

          {/* Image input and Save button */}
          <div className="mt-6">
            <label className="block mb-1 font-semibold">Image of the Meal</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={`w-full p-2 border-2 rounded-lg ${errors.meal_image ? 'border-red-500' : 'border-green-500'}`}
            />
            {errors.meal_image && <p className="text-red-500 text-xs mt-1">{errors.meal_image}</p>}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 rounded-lg w-full h-40 object-cover"
              />
            )}
          </div>

          {/* Save button - smaller and centered */}
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className={`bg-green-600 text-white py-2 px-8 rounded-lg hover:bg-green-700 ${
                Object.values(errors).some(err => err) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={Object.values(errors).some(err => err)}
            >
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-4 w-72 text-center">
            <h2 className="text-xl font-semibold mb-4 text-green-700">Meal added successfully!</h2>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMeals;