import React from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/button";
import { ROUTES } from "../routes/paths";
const Menu = () => {
  const navigate = useNavigate();

  //add to cart button
  const handleAddToCart = () => {
    console.log("Navigating to Cart Page...");
    navigate(ROUTES.CART);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold">Menu Page</h1>

      <Button onClick={handleAddToCart} className="mt-4">
        Add to Cart
      </Button>
    </div>
  );
};

export default Menu;
