import { apiClient } from "../api/apiClient.js";
import { END_POINTS } from "../api/endPoints.js";
import { useMutation } from "@tanstack/react-query";

// Function to delete a specific meal from the cart
const deleteCartDetails = async ({ cart_id, meal_id }) => {
  try {
    if (!cart_id || !meal_id) {
      throw new Error("Missing cart_id or meal_id");
    }
    const url = END_POINTS.DELETE_CART_MEAL(cart_id, meal_id);
    console.log(`Sending DELETE request to: ${url}`);
    const response = await apiClient.delete(url);
    console.log("Delete response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Delete Cart Meal Error:", error.message, error.response?.data);
    throw error;
  }
};

// Custom hook to use the delete cart meal mutation
export const useDeleteCartDetails = () => {
  return useMutation({
    mutationFn: deleteCartDetails,
  });
};