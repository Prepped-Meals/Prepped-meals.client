import { apiClient } from "../api/apiClient.js";
import { END_POINTS } from "../api/endPoints.js";
import { useQuery } from "@tanstack/react-query";

const getOrdersByCustomer = async (customerId) => {
  const response = await apiClient.get(
    `${END_POINTS.GET_ORDER_DETAILS}/${customerId}`
  );
  return response.data;
};

export const useGetOrdersByCustomer = (customerId) => {
  return useQuery({
    queryKey: ["orders", customerId],
    queryFn: () => getOrdersByCustomer(customerId),
    enabled: !!customerId,
  });
};
