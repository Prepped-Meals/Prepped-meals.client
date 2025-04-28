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

  const [imagePreview, setImagePreview] = useState(null);
  const { mutateAsync: saveMeal } = useSaveMeal();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        meal_image: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.meal_name.trim()) {
      alert("Meal name is required.");
      return;
    }
    if (!formData.meal_description.trim()) {
      alert("Meal description is required.");
      return;
    }
    if (!formData.admin.trim()) {
      alert("Admin field is required.");
      return;
    }
    if (formData.meal_price === '' || parseFloat(formData.meal_price) <= 0) {
      alert("Please enter a valid meal price greater than 0.");
      return;
    }
    if (formData.calorie_count === '' || parseInt(formData.calorie_count) <= 0) {
      alert("Please enter valid calorie count greater than 0.");
      return;
    }
    if (formData.meal_stock === '' || parseInt(formData.meal_stock) < 0) {
      alert("Please enter a valid stock quantity (0 or more).");
      return;
    }
    if (!formData.meal_image) {
      alert("Please upload a meal image.");
      return;
    }

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
      alert("Meal added successfully");
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
                className="w-full p-2 border-2 rounded-lg border-green-500"
                placeholder="Enter meal name"
                value={formData.meal_name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Description</label>
              <textarea
                type="text"
                name="meal_description"
                className="w-full p-2 border-2 rounded-lg border-green-500 whitespace-pre-line"
                placeholder="Enter description"
                value={formData.meal_description}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Price</label>
              <div className="flex items-center border-2 rounded-lg border-green-500 overflow-hidden">
                <span className="px-5 py-4 bg-green-500 text-white font-semibold">Rs.</span>
                <input
                  type="number"
                  name="meal_price"
                  className="w-full p-2 outline-none"
                  placeholder="Enter price"
                  value={formData.meal_price}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-semibold">Calories</label>
              <div className="flex items-center border-2 rounded-lg border-green-500 overflow-hidden">
                <input
                  type="number"
                  name="calorie_count"
                  className="w-full p-2 outline-none"
                  placeholder="Enter calories"
                  value={formData.calorie_count}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                />
                <span className="px-3 py-4 bg-green-500 text-white font-semibold">Kcal</span>
              </div>
            </div>

            <div>
              <label className="block mb-1 font-semibold">Admin</label>
              <input
                type="text"
                name="admin"
                className="w-full p-2 border-2 rounded-lg border-green-500"
                placeholder="Enter admin"
                value={formData.admin}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Meal Stock</label>
              <input
                type="number"
                name="meal_stock"
                className="w-full p-2 border-2 rounded-lg border-green-500"
                placeholder="Enter stock quantity"
                value={formData.meal_stock}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          {/* Image input and Save button */}
          <div className="mt-6">
            <label className="block mb-1 font-semibold">Image of the Meal</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border-2 rounded-lg border-green-500"
            />
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
              className="bg-green-600 text-white py-2 px-8 rounded-lg hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMeals;
