import { apiClient } from "../api/apiClient.js";
import { END_POINTS } from "../api/endPoints.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const saveOrderDetails = async (orderData) => {
  const response = await apiClient.post(
    END_POINTS.SAVE_ORDER_DETAILS,
    orderData
  );
  return response.data;
};

export const useSaveOrderDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveOrderDetails,
    onSuccess: (data) => {
      console.log("Order saved successfully:", data);
      queryClient.invalidateQueries(["orderDetails"]);
    },
  });
};
