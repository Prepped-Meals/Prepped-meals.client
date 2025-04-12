import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/apiClient.js";

// Function to fetch customer details
const fetchCustomerDetails = async () => {
  const { data } = await apiClient.get("/customers"); 
  return data;
};

// Custom hook to get customer details
export const useGetCusDetails = () => {
  return useQuery({
    queryKey: ["customerDetails"], // Unique key for customer details
    queryFn: fetchCustomerDetails, // Function to fetch customer details
  });
};