import React from 'react';
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/button";
import { ROUTES } from '../routes/paths';
import SidebarAdmin from '../components/sidebarAdmin';
import { useFetchMeals } from '../hooks/useFetchMeals';
import HeaderAdmin from '../components/headerAdmin'; 
import MealPopup from '../components/mealpopup';
import UpdateMealPopup from '../components/updateMealpop';
import { FiDownload } from "react-icons/fi";

const MealsAdmin = () => {
    const aNavigate = useNavigate();
    const { data: meals, isError, isLoading } = useFetchMeals();

    const [selectedMeal, setSelectedMeal] = React.useState(null);
    const [showPopup, setShowPopup] = React.useState(false);
    const [showUpdatePopup, setShowUpdatePopup] = React.useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [showDeleteSuccess, setShowDeleteSuccess] = React.useState(false);

    // New state for search input
    const [searchTerm, setSearchTerm] = React.useState("");

    const handleAddMealClick = () => {
        console.log("Add meals button clicked");
        aNavigate(ROUTES.ADD_MEALS);
    };

    const handleMealCardClick = (meal) => {
        setSelectedMeal(meal);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedMeal(null);
    };

    const handleUpdateMeal = (mealId, formData) => {
        fetch(`/api/meals/${mealId}`, {
            method: 'PUT',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log("Meal updated:", data);
            setShowUpdatePopup(false);
        })
        .catch(error => {
            console.error("Error updating meal:", error);
        });
    };

    const handleDeleteMeal = async () => {
        try {
            await fetch(`/api/create-meals/${selectedMeal.meal_id}`, {
                method: 'DELETE',
            });
            setShowDeleteConfirm(false);
            setShowPopup(false);
            setSelectedMeal(null);
            setShowDeleteSuccess(true);
        } catch (error) {
            console.error("Error deleting meal:", error);
            alert("Failed to delete meal.");
        }
    };

    if (isLoading) return <p>Loading meals...</p>;
    if (isError) return <p>Error fetching meals</p>;

    // Filter meals by search term (case-insensitive)
    const filteredMeals = meals.filter(meal =>
        meal.meal_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SidebarAdmin />
            <div className="flex-1 flex flex-col">
                <HeaderAdmin />
                <div className="p-6 flex-1">
                    <h1 className="text-2xl font-bold mb-4 mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>MEALS</h1>

                    <div className="bg-gray-200 p-4 rounded-lg shadow-md" style={{ minHeight: '80vh' }}>
                        
                        {/* Action Buttons Group */}
                        <div className="flex flex-wrap gap-4 mt-4 mb-6">
                            <Button onClick={handleAddMealClick} className="bg-green-700 text-white">
                                Add Meals
                            </Button>
                            <Link to={ROUTES.ADMIN_MEALREPORT}>
                                <Button className="bg-green-700 text-white flex items-center gap-2">
                                    Reports <FiDownload size={18} />
                                </Button>
                            </Link>
                        </div>

                        {/* Search bar in a clean container */}
                        <div className="mb-8 max-w-sm">
                            <input
                                type="text"
                                placeholder="Search meals..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                                aria-label="Search meals"
                            />
                        </div>

                        {filteredMeals && filteredMeals.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredMeals.map((meal, index) => (
                                    <div
                                        key={meal.meal_id || index}
                                        className="relative bg-white rounded-xl shadow hover:shadow-md p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer"
                                        onClick={() => handleMealCardClick(meal)}
                                    >
                                        {/* Low Stock Badge */}
                                        {meal.meal_stock !== undefined && meal.meal_stock < 10 && (
                                            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded shadow">
                                                Low Stock ({meal.meal_stock})
                                            </div>
                                        )}

                                        {/* Meal Image */}
                                        <img
                                            src={meal.meal_image || 'https://via.placeholder.com/150'}
                                            alt={meal.meal_name || 'Meal Image'}
                                            className="rounded-lg mb-3 w-full h-40 object-cover"
                                        />

                                        {/* Meal Info */}
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 mb-1">ID: #{meal.meal_id}</p>
                                            <h2 className="text-md font-semibold mb-1">{meal.meal_name || 'Unnamed Meal'}</h2>
                                            <p className="text-sm text-gray-700 mb-1">Rs. {meal.meal_price || 'N/A'}</p>
                                            <p className="text-xs text-gray-500 line-clamp-2 whitespace-pre-line">
                                                {meal.meal_description || 'No description available'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 mt-4">No meals found.</p>
                        )}
                    </div>
                </div>

                {showPopup && selectedMeal && (
                    <MealPopup
                        meal={selectedMeal}
                        onClose={handleClosePopup}
                        onUpdate={() => {
                            setShowPopup(false);
                            setShowUpdatePopup(true);
                        }}
                        onDelete={() => setShowDeleteConfirm(true)}
                    />
                )}

                {showUpdatePopup && selectedMeal && (
                    <UpdateMealPopup
                        meal={selectedMeal}
                        onClose={() => {
                            setShowUpdatePopup(false);
                            setSelectedMeal(null);
                        }}
                        onSubmit={handleUpdateMeal}
                    />
                )}

                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-72 text-center">
                            <h2 className="text-lg font-semibold mb-4 text-red-600">Are you sure you want to delete this meal?</h2>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleDeleteMeal}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteSuccess && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg shadow-lg p-4 w-72 text-center">
                            <h2 className="text-lg font-semibold mb-4 text-green-700">Meal deleted successfully!</h2>
                            <button
                                onClick={() => {
                                    setShowDeleteSuccess(false);
                                    window.location.reload();
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MealsAdmin;
