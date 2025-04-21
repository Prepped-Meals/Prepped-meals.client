import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/button";
import { ROUTES } from "../routes/paths";
import bannerImg from "../assets/images/banner.jpg"; 

const Home = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log("Button clicked!");
    navigate(ROUTES.PAYMENT);
  };

  const handleAdminClick = () => {
    console.log("Admin Meal button clicked");
    navigate(ROUTES.MEALS_ADMIN);
  };

  const handleCartClick = () => {
    console.log("Go to Cart clicked!");
    navigate(ROUTES.CART);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-200">

      {/* Local Image at Top */}
      <div className="w-full h-100">
        <img
          src={bannerImg}
          alt="Home Page Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Buttons Below */}
      <div className="flex flex-row items-center justify-center my-8 space-x-4">
        <Button onClick={handleClick}>Go to Payment</Button>
        <Button onClick={handleCartClick}>Go to Cart</Button>
        <Button onClick={handleAdminClick}>Admin Meals</Button>
      </div>
    </div>
  );
};

export default Home;
