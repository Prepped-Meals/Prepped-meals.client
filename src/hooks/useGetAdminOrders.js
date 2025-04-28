import { apiClient } from "../api/apiClient";
import { END_POINTS } from "../api/endPoints";
import { useQuery } from "@tanstack/react-query";

const getAllOrders = async () => {
  const response = await apiClient.get(END_POINTS.GET_ORDER_DETAILS);
  return response.data;
};

export const useGetAllOrders = () => {
  return useQuery({
    queryKey: ["allOrders"],
    queryFn: getAllOrders,
  });
};
