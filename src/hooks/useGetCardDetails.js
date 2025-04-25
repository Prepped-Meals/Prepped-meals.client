import { apiClient } from "../api/apiClient.js";
import { END_POINTS } from "../api/endPoints.js";
import { useQuery } from "@tanstack/react-query";

const getCardDetails = async (cardId) => {
  return await apiClient.get(`${END_POINTS.GET_CARD_DETAILS}/${cardId}`);
};

export const useGetCardDetails = (cardId) => {
  return useQuery({
    queryKey: ["cardDetails", cardId],
    queryFn: () => getCardDetails(cardId),
  });
};

