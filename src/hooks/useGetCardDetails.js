import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/apiClient.js";

const fetchCardDetails = async () => {
  const { data } = await apiClient.get("/card-details");
  return data;
};

export const useGetCardDetails = () => {
  return useQuery({
    queryKey: ["cardDetails"],
    queryFn: fetchCardDetails,
  });
};
