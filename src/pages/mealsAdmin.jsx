import React from 'react'
import { useNavigate } from "react-router-dom";
import Button from "../components/button";
import { ROUTES } from '../routes/paths';
import SidebarAdmin from '../components/sidebarAdmin';
import { useFetchMeals } from '../hooks/useFetchMeals';
import HeaderAdmin from '../components/headerAdmin'; // Make sure this is the correct import

const MealsAdmin = () => {
    const aNavigate = useNavigate();
    const { data: meals, isError, isLoading } = useFetchMeals();

    const handleAddMealClick = () => {
        console.log("Add meals button clicked");
        aNavigate(ROUTES.ADD_MEALS);
    };

    if (isLoading) {
        return <p>Loading meals...</p>;
    }

    if (isError) {
        return <p>Error fetching meals</p>;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <SidebarAdmin />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <HeaderAdmin />

                {/* Page Content */}
                <div className="p-6 flex-1">
                    {/* Page Header */}
                    <h1 className="text-2xl font-bold mb-4 mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>MEALS</h1>

                    {/* Add Meals Section */}
                    <div className="bg-yellow-100 p-4 rounded-lg shadow-md" style={{ minHeight: '80vh' }}>
                        <div className="flex gap-4 flex-wrap">
                            <Button onClick={handleAddMealClick} className="bg-green-700 text-white mt-4">Add Meals</Button>
                            <Button className="bg-green-700 text-white mt-4">Reports</Button>
                        </div>

                        <h1 className="text-xl font-bold mb-4 mt-10">MEALS ADDED</h1>

                        {/* Meal Cards */}
                        {meals && meals.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {meals.map((meal, index) => (
                                    <div key={meal.meal_id || index} className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center">
                                        <img
                                            src={meal.imageUrl || 'https://via.placeholder.com/150'}
                                            alt={meal.meal_name || 'Meal Image'}
                                            className="rounded-lg mb-4 w-full h-40 object-cover"
                                        />
                                        <p className="text-sm font-semibold text-gray-600">#{meal.meal_id || 'N/A'}</p>
                                        <h2 className="text-lg font-bold mb-1">{meal.meal_name || 'Unnamed Meal'}</h2>
                                        <p className="text-gray-800">Rs. {meal.meal_price || 'Price not available'}</p>
                                        <p className="text-sm text-gray-500 text-center">{meal.meal_description || 'No description available'}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 mt-4">No meals added yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MealsAdmin;
