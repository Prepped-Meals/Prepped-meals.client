import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/apiClient.js";
import { END_POINTS } from "../api/endPoints.js";

// Function to fetch meals details
const fetchMeals = async () => {
  const { data } = await apiClient.get(END_POINTS.GET_MEAL_DETAILS); 
  return data.meals;
};

// Custom hook to get customer details
export const useFetchMeals = () => {
  return useQuery({
    queryKey: ["meals"], // Unique key for customer details
    queryFn: fetchMeals, // Function to fetch customer details
  });
};