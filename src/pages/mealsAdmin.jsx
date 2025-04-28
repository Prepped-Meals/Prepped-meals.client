import React from 'react';
import { useNavigate , Link} from "react-router-dom";
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

    const handleAddMealClick = () => {
        console.log("Add meals button clicked");
        aNavigate(ROUTES.ADD_MEALS);
    };

    const [selectedMeal, setSelectedMeal] = React.useState(null);
    const [showPopup, setShowPopup] = React.useState(false);
    const [showUpdatePopup, setShowUpdatePopup] = React.useState(false);

    const handleMealCardClick = (meal) => {
        setSelectedMeal(meal);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedMeal(null);
    };

    const handleUpdateMeal = (mealId, formData) => {
        // Example: Use a function to update the meal in your database
        console.log("Updating meal with ID:", mealId);

        // Example of what an API call might look like:
        fetch(`/api/meals/${mealId}`, {
            method: 'PUT',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log("Meal updated:", data);
            // You can refresh the meal list here or close the popup
            setShowUpdatePopup(false); // Close the update popup
            // Optionally, you can refetch the meal list after update
            // setMeals(updatedMeals); or use another method to refetch meals.
        })
        .catch(error => {
            console.error("Error updating meal:", error);
        });
    };

    if (isLoading) {
        return <p>Loading meals...</p>;
    }

    if (isError) {
        return <p>Error fetching meals</p>;
    }


    //for deleting meals
    const handleDeleteMeal = async (mealId) => {
        const confirmed = window.confirm("Are you sure you want to delete this meal?");
        if (!confirmed) return;
    
        try {
            await fetch(`/api/create-meals/${mealId}`, {
                method: 'DELETE',
            });
    
            alert("Meal deleted successfully!");
            setShowPopup(false); // close the popup
            setSelectedMeal(null);
            window.location.reload(); // reload page to reflect changes
        } catch (error) {
            console.error("Error deleting meal:", error);
            alert("Failed to delete meal.");
        }
    };
    

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
                            <Link to = {ROUTES.ADMIN_MEALREPORT}> 
                            <Button className="bg-green-700 text-white mt-4">Reports</Button>
                            </Link>
                        </div>

                        <h1 className="text-xl font-bold mb-4 mt-10">MEALS ADDED</h1>

                        {/* Meal Cards */}
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
                        onDelete={() => handleDeleteMeal(selectedMeal.meal_id)}
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
            </div>
        </div>
    );
};

export default MealsAdmin;
