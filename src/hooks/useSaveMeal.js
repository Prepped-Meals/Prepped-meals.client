import {useMutation} from "@tanstack/react-query";
import { apiClient } from "../api/apiClient.js";
import { END_POINTS } from "../api/endPoints.js";

//function to save meal details
// const saveMealDetails = async (mealData) =>{
//     return await apiClient.post(END_POINTS.SAVE_MEAL_DETAILS,mealData);
// };

const saveMealDetails = async (mealData) => {
    try {
        const response = await apiClient.post(END_POINTS.SAVE_MEAL_DETAILS, mealData);
        return response.data;
    } catch (error) {
        console.error("API Error:", error.response ? error.response.data : error.message);
        throw error; // Ensure the error is thrown so `onError` is triggered
    }
};


//customer hook to save meal detials
export const useSaveMeal = () =>{
    return useMutation({
        mutationFn: saveMealDetails,
        onSuccess: () => {
            console.log("meal details saved successfully ");
        },

        onError: (error) =>{
            console.log ("Error saving meal details:",error);
        },
    });

};