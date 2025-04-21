import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/apiClient.js";

// Function to fetch meals details
const fetchMeals = async () => {
  const { data } = await apiClient.get("/create-meals"); 
  return data;
};

// Custom hook to get customer details
export const usefetchMeals = () => {
  return useQuery({
    queryKey: ["meals"], // Unique key for customer details
    queryFn: fetchMeals, // Function to fetch customer details
  });
};