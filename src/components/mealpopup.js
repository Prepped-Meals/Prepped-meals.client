import React from 'react';

const MealPopup = ({ meal, onClose, onUpdate, onDelete }) => {
    if (!meal) return null;

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
                        src={meal.meal_image || 'https://via.placeholder.com/300'}
                        alt={meal.meal_name}
                        className="rounded-xl max-h-[400px] object-cover"
                    />
                </div>

                {/* Right: Details */}
                <div className="w-1/2 p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-green-700">MEAL DETAILS</h2>

                        <p><span className="font-semibold">Meal ID:</span> #{meal.meal_id}</p>
                        <p><span className="font-semibold">Name:</span> {meal.meal_name}</p>
                        <p><span className="font-semibold">Price:</span> Rs. {meal.meal_price}</p>
                        <p><span className="font-semibold">Meal Stock: </span>{meal.meal_stock}</p>
                        <p><span className="font-semibold">Calories:</span> {meal.calorie_count} kcal</p>


                        <p className="mt-2"><span className="font-semibold">Description:</span></p>
                        <p className="text-sm text-gray-700">{meal.meal_description}</p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={onUpdate}
                            className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700"
                        >
                            Update
                        </button>
                        <button
                            onClick={onDelete}
                            className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MealPopup;
