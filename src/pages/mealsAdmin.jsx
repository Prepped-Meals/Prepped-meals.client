import React from 'react'
import {useNavigate} from "react-router-dom";
import Button from "../components/button";
import {ROUTES} from '../routes/paths';

const MealsAdmin = () => {
    const aNavigate = useNavigate();

    const handleAddMealClick = () => {
        console.log("Add meals button clicked");
        aNavigate(ROUTES.ADD_MEALS);
    };
    
  return (
    <div className = "flex h-screen bg-gray-100">
    {/*space for sidebar*/}
    <div className = "w-64  bg-gray-200">/</div>

    {/*main content area*/}
        <div className = "flex-1 p-6">

        {/*Page header*/}
        <h1 className = "text-2xl font-bold mb-4 mt-2" style={{fontFamily:'Poppins, sans-serif'}}>MEALS</h1>

        {/*added a div to seperate meals and header*/}
        <div className = "bg-yellow-100 p-4 rounded-lg shadow-md" style={{minHeight: '80vh'}}>

        {/*Add meals button*/}
        <Button onClick={handleAddMealClick} className = "bg-green-700 text-white mt-4" >Add Meals</Button>

        <h1 className = "text-1xl font-bold mb-4 mt-10">MEALS ADDED</h1>

            {/*placeholder for view meal data)*/}
            <div className = "text-gray-500">Meal data</div>
            </div>
         </div>
    </div>   
  );
};

export default MealsAdmin;