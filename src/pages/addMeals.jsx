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
    meal_image: null, // ✅ image field
  });

  const [imagePreview, setImagePreview] = useState(null); // Optional: for preview
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
      setImagePreview(URL.createObjectURL(file)); // Optional
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submissionData = new FormData();
    submissionData.append("meal_name", formData.meal_name);
    submissionData.append("meal_description", formData.meal_description);
    submissionData.append("meal_price", formData.meal_price);
    submissionData.append("calorie_count", formData.calorie_count);
    submissionData.append("admin", formData.admin);

    if (formData.meal_image) {
      submissionData.append("meal_image", formData.meal_image); // ✅ send image
    }

    try {
      await saveMeal(submissionData); // Send FormData
      alert("Meal added successfully");
      setFormData({
        meal_name: '',
        meal_description: '',
        meal_price: '',
        calorie_count: '',
        admin: '',
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
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-[400px]">
          <h2 className="text-2xl font-bold mb-6 text-center">ADD MEALS</h2>

          <div className="mb-4">
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

          <div className="mb-4">
            <label className="block mb-1 font-semibold">Description</label>
            <input
              type="text"
              name="meal_description"
              className="w-full p-2 border-2 rounded-lg border-green-500"
              placeholder="Enter description"
              value={formData.meal_description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
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

    <div className="mb-4">
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
      step="1" // prevent decimal points
      required
    />
    <span className="px-3 py-4 bg-green-500 text-white font-semibold">Kcal</span>
  </div>
</div>

          <div className="mb-4">
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

          <div className="mb-4">
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

          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMeals;
