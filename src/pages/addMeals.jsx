import React from 'react'
import mealbg from "../assets/meal1.png";

const AddMeals = () => {
  return (
    <div className ="h-screen w-full bg-cover bg-center" style={{backgroundImage:`url(${mealbg})`}}>
        <div className = "flex justify-center items-center h-full">
            <form className = "bg-white p-8 rounded-2xl shadow-lg w-[400px]">
                <h2 className="text-2xl font-bold mb-6 text-center">ADD MEALS</h2>
                <div className ="mb-4">
                    <label className="block mb-1 font-semibold">Meal Name</label>
                    <input type="text" className="w-full p-2 border-2 rounded-lg border-green-500" placeholder="Enter meal name"/>
                </div>
                <div className = "mb-4">
                    <label className= "block mb-1 font-semibold">Description</label>
                    <input type="text" className= "w-full p-2 border-2 rounded-lg border-green-500" placeholder="Enter description"/>
                </div>
                <div className="mb-4">
                    <label className= "block mb-1 font-semibold">Price</label>
                    <input type="number" className= "w-full p-2 border-2 rounded-lg border-green-500" placeholder="Enter price"/>
                </div>
                <div className = "mb-4">
                    <label className= "block mb-1 font-semibold">Calories</label>
                    <input type="number" className= "w-full p-2 border-2 rounded-lg border-green-500" placeholder="Enter calories"/>
                </div>
                <div className = "mb-4">
                    <label className= "block mb-1 font-semibold">Nutritional Information</label>
                    <input type="text" className= "w-full p-2 border-2 rounded-lg border-green-500" placeholder="Enter nutritional information"/>
                </div>
                <div className = "mb-4">
                    <label className= "block mb-1 font-semibold">Image of the meal</label>
                    <input type="file" className= "w-full p-2 border-2 rounded-lg border-green-500" placeholder="Enter nutritional information"/>
                </div>
                <button type="Submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Save</button>
            </form>
        </div>
    </div>
  );
};

export default AddMeals;