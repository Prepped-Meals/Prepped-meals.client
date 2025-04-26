import { apiClient } from "../api/apiClient.js";
import { END_POINTS } from "../api/endPoints.js";
import { useMutation } from "@tanstack/react-query";

// Function to delete cart details
const deleteCartDetails = async (cart_id) => {
  return await apiClient.delete(END_POINTS.DELETE_CART_DETAILS(cart_id));
};

// Custom hook to use the delete cart mutation
export const useDeleteCartDetails = () => {
  return useMutation({
    mutationFn: deleteCartDetails,
  });
};
