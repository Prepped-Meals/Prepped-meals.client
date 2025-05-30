import { apiClient } from "../api/apiClient.js";
import { END_POINTS } from "../api/endPoints.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const savePaymentDetails = async (paymentData) => {
  const response = await apiClient.post(
    END_POINTS.SAVE_PAYMENT_DETAILS,
    paymentData
  );
  return response.data;
};

export const useSavePaymentDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: savePaymentDetails,
    onSuccess: (data) => {
      console.log("Success response data:", data);
      queryClient.invalidateQueries(["paymentDetails"]);
    },
  });
};
