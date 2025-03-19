import { END_POINTS } from "../api/endPoints.js";
import { apiClient } from "../api/apiClient.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const saveCardDetails = async (cardData) => {
  return await apiClient.post(END_POINTS.SAVE_CARD_DETAILS, cardData);
};

export const useSaveCardDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveCardDetails,
    onSuccess: () => {
      queryClient.invalidateQueries(["cardDetails"]); // Refetch updated data
    },
  });
};
