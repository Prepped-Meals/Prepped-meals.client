import React from 'react';
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/button";
import { ROUTES } from '../routes/paths';
import SidebarAdmin from '../components/sidebarAdmin';
import { useFetchMeals } from '../hooks/useFetchMeals';
import HeaderAdmin from '../components/headerAdmin'; 
import MealPopup from '../components/mealpopup';
import UpdateMealPopup from '../components/updateMealpop';

const MealsAdmin = () => {
    const aNavigate = useNavigate();
    const { data: meals, isError, isLoading } = useFetchMeals();

    const [selectedMeal, setSelectedMeal] = React.useState(null);
    const [showPopup, setShowPopup] = React.useState(false);
    const [showUpdatePopup, setShowUpdatePopup] = React.useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [showDeleteSuccess, setShowDeleteSuccess] = React.useState(false);

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

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SidebarAdmin />
            <div className="flex-1 flex flex-col">
                <HeaderAdmin />
                <div className="p-6 flex-1">
                    <h1 className="text-2xl font-bold mb-4 mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>MEALS</h1>

                    <div className="bg-yellow-100 p-4 rounded-lg shadow-md" style={{ minHeight: '80vh' }}>
                        <div className="flex gap-4 flex-wrap">
                            <Button onClick={handleAddMealClick} className="bg-green-700 text-white mt-4">Add Meals</Button>
                            <Link to={ROUTES.ADMIN_MEALREPORT}>
                                <Button className="bg-green-700 text-white mt-4">Reports</Button>
                            </Link>
                        </div>

                        <h1 className="text-xl font-bold mb-4 mt-10">MEALS ADDED</h1>

                        {meals && meals.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {meals.map((meal, index) => (
                                    <div key={meal.meal_id || index} className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center"
                                        onClick={() => handleMealCardClick(meal)}
                                    >
                                        <img
                                            src={meal.meal_image || 'https://via.placeholder.com/150'}
                                            alt={meal.meal_name || 'Meal Image'}
                                            className="rounded-lg mb-4 w-full h-40 object-cover"
                                        />
                                        <p className="text-sm font-semibold text-gray-600">#{meal.meal_id || 'N/A'}</p>
                                        <h2 className="text-lg font-bold mb-1">{meal.meal_name || 'Unnamed Meal'}</h2>
                                        <p className="text-gray-800">Rs. {meal.meal_price || 'Price not available'}</p>
                                        <p className="text-sm text-gray-500 text-center whitespace-pre-line">{meal.meal_description || 'No description available'}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 mt-4">No meals added yet.</p>
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

                {/* Delete Confirmation Modal */}
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

                {/* Delete Success Modal */}
                {showDeleteSuccess && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg shadow-lg p-4 w-72 text-center">
                            <h2 className="text-lg font-semibold mb-4 text-green-700">Meal deleted successfully!</h2>
                            <button
                                onClick={() => {
                                    setShowDeleteSuccess(false);
                                    window.location.reload(); // optional: refresh after dismiss
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
