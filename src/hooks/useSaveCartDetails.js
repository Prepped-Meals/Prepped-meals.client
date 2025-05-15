import { apiClient } from "../api/apiClient.js";
import { END_POINTS } from "../api/endPoints.js";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../context/authContext";

export const useSaveCart = () => {
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: async (cartData) => {
      const response = await apiClient.post(END_POINTS.SAVE_CART_DETAILS, cartData);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.cart?.cart_id) {
        console.log("Saving cart_id to user:", data.cart.cart_id);
        setUser((prev) => {
          const updatedUser = { ...prev, cart_id: data.cart.cart_id };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
    },
    onError: (error) => {
      console.error("Save Cart Error:", error);
    },
  });
};