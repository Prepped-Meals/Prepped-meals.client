import { apiClient } from "../api/apiClient.js";
import { END_POINTS } from "../api/endPoints.js";
import { useMutation } from "@tanstack/react-query";

const deleteCardDetails = async (cardId) => {
  return await apiClient.delete(END_POINTS.DELETE_CARD_DETAILS(cardId));
};

export const useDeleteCardDetails = () => {
  return useMutation({
    mutationFn: deleteCardDetails,
  });
};


