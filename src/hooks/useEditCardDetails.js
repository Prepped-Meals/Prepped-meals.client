import { apiClient } from "../api/apiClient.js";
import { END_POINTS } from "../api/endPoints.js";
import { useMutation } from "@tanstack/react-query";

const editCardDetails = async ({ cardId, updatedCardData }) => {
  return await apiClient.put(END_POINTS.UPDATE_CARD_DETAILS(cardId), updatedCardData);
};

export const useEditCardDetails = () => {
  return useMutation({
    mutationFn: editCardDetails,
  });
};


