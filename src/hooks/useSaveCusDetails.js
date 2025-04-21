import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/apiClient.js";
import { END_POINTS } from "../api/endPoints.js";

// Function to save customer details

const saveCustomerDetails = async (customerData) => {
  return await apiClient.post(END_POINTS.SAVE_CUSTOMER_DETAILS, customerData);
  };

  
// Custom hook to save customer details
export const useSaveCusDetails = () => {
  return useMutation({
    mutationFn: saveCustomerDetails,
    onSuccess: () => {
      console.log("Customer details saved successfully!");
    },
    onError: (error) => {
      console.error("Error saving customer details:", error);
    },
  });
};