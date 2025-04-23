import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/apiClient.js";
import { END_POINTS } from "../api/endPoints.js";

// Function to save cart details
const saveCartDetails = async (cartData) => {
  try {
    const response = await apiClient.post(END_POINTS.SAVE_CART_DETAILS, cartData);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response ? error.response.data : error.message);
    throw error; // Important for triggering onError
  }
};

// Hook to use in components
export const useSaveCart = () => {
  return useMutation({
    mutationFn: saveCartDetails,
    onSuccess: () => {
      console.log("Cart saved successfully");
    },
    onError: (error) => {
      console.log("Error saving cart:", error);
    },
  });
};
