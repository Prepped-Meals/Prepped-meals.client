import { apiClient } from "../api/apiClient.js";
import { END_POINTS } from "../api/endPoints.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const savePaymentDetails = async (paymentData) => {
  return await apiClient.post(END_POINTS.SAVE_PAYMENT_DETAILS, paymentData);
};
 
export const useSavePaymentDetails = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: savePaymentDetails,
    onSuccess: () => {
      queryClient.invalidateQueries(["paymentDetails"]); // Refresh payment data after save
    },
  });
};
