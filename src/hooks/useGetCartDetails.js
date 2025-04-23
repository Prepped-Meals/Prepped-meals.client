import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/apiClient.js";
import { END_POINTS } from "../api/endPoints.js";

// Function to fetch cart details
const fetchCartDetails = async () => {
  const { data } = await apiClient.get(END_POINTS.GET_CART_DETAILS);
  return data;
};

// Custom hook to get cart details
export const useGetCartDetails = () => {
  return useQuery({
    queryKey: ["cartDetails"], // Unique key for react-query cache
    queryFn: fetchCartDetails, // Fetch function
  });
};
