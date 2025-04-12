import React from "react";
import {useNavigate} from "react-router-dom";
import Button from "../components/button";
import { ROUTES } from "../routes/paths";

const Home = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log("Button clicked!");
    navigate(ROUTES.PAYMENT);
  };

  const handleAdminClick = () =>{
    console.log("Admin Meal button clicked");
    navigate(ROUTES.MEALS_ADMIN);
  }
  
  const handleCartClick = () => {
    console.log("Go to Cart clicked!");
    navigate(ROUTES.CART);
  };

  const handleProfileClick = () => {
    console.log("Customer Profile clicked!");
    navigate(ROUTES.CUSTOMER_PROFILE);
  };
  
  

  return (
    <>

      <div className="flex flex-col items-center justify-center h-screen bg-gray-200">
        <h1 className="text-4xl font-bold">Welcome to the Home Page</h1>
        <p className="text-lg mt-2">
          This is a basic home screen for your app.
        </p>
        <Button onClick={handleClick}>Go to Payment</Button>
        <Button onClick={handleCartClick} className="mt-2">
          Go to Cart
        </Button>
        <Button onClick={handleAdminClick} className = "mt-4">Admin Meals</Button>
        <Button onClick={handleProfileClick} className="mt-2">
         Go to Customer Profile
        </Button>

      </div>

      
    </>
  );
};

export default Home;
