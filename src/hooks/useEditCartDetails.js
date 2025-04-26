import { apiClient } from "../api/apiClient.js";
import { END_POINTS } from "../api/endPoints.js";
import { useMutation } from "@tanstack/react-query";

// Function to edit cart details
const editCartDetails = async ({ cart_id, updatedCartData }) => {
  return await apiClient.put(END_POINTS.UPDATE_CART_DETAILS(cart_id), updatedCartData);
};

// Custom hook to use the edit cart mutation
export const useEditCartDetails = () => {
  return useMutation({
    mutationFn: editCartDetails,
  });
};
