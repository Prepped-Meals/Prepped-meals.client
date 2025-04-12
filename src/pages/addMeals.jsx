import React ,{useState} from 'react';
import mealbg from "../assets/meal1.png";
import { useSaveMeal } from '../hooks/useSaveMeal';


const AddMeals = () => {
    const  [FormData, setFormData] = useState({
        meal_name: '',
        meal_description:'',
        meal_price: '',
        calorie_count:'',
        admin: '',
    });

    const { mutateAsync: saveMeal } = useSaveMeal();

    
    // const handleChange = (e) => {
    //     const {name, value} = e.target;
    //     setFormData({...FormData, [name]: value});
    // };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };
    

    const handleSubmit = async (e) =>{
        e.preventDefault();
        console.log("Form Data:", FormData);

        try {
            await saveMeal(FormData); // Call saveMeal
            alert("Meals added successfully");
            setFormData({
                meal_name: '',
                meal_description: '',
                meal_price: '',
                calorie_count: '',
                admin: '',
            });
        } catch (error) {
            console.error('Error:', error);
            alert("An error occurred. Please try again.");
        }


    };
  return (
    <div className ="h-screen w-full bg-cover bg-center" style={{backgroundImage:`url(${mealbg})`}}>
        <div className = "flex justify-center items-center h-full">
            {/* //form */}
            <form onSubmit ={handleSubmit} className = "bg-white p-8 rounded-2xl shadow-lg w-[400px]">

                <h2 className="text-2xl font-bold mb-6 text-center">
                    ADD MEALS</h2>
                <div className ="mb-4">
                    <label className="block mb-1 font-semibold">
                    Meal Name</label>
                    <input type="text" 
                    name = "meal_name"
                    className="w-full p-2 border-2 rounded-lg border-green-500" 
                    placeholder="Enter meal name"
                    value = {FormData.meal_name}
                    onChange={handleChange}
                    required
                    />
                </div>
                <div className = "mb-4">
                    <label className= "block mb-1 font-semibold">
                    Description</label>
                    <input type="text" 
                    name = "meal_description"
                    className= "w-full p-2 border-2 rounded-lg border-green-500" 
                    placeholder="Enter description"
                    value = {FormData.meal_description}
                    onChange={handleChange}
                    required
                    />
                </div>
                <div className="mb-4">
                    <label className= "block mb-1 font-semibold">
                    Price</label>
                    <input type="number" 
                    name = "meal_price"
                    className= "w-full p-2 border-2 rounded-lg border-green-500"
                     placeholder="Enter price"
                     value = {FormData.meal_price}
                     onChange={handleChange}
                     required
                     />
                </div>
                <div className = "mb-4">
                    <label className= "block mb-1 font-semibold">
                    Calories</label>
                    <input type="number" 
                    name = "calorie_count"
                    className= "w-full p-2 border-2 rounded-lg border-green-500" 
                    placeholder="Enter calories"
                    value = {FormData.calorie_count}
                    onChange={handleChange}
                    required
                    />
                </div>
                <div className = "mb-4">
                    <label className= "block mb-1 font-semibold">
                    Admin </label>
                    <input type="text"
                    name = "admin"
                    className= "w-full p-2 border-2 rounded-lg border-green-500" 
                    placeholder="Enter admin"
                    value = {FormData.admin}
                    onChange ={handleChange}
                    required
                    />
                </div>
                {/* <div className = "mb-4">
                    <label className= "block mb-1 font-semibold">Nutritional Information</label>
                    <input type="text" className= "w-full p-2 border-2 rounded-lg border-green-500" placeholder="Enter nutritional information"/>
                </div> */}
                {/* <div className = "mb-4">
                    <label className= "block mb-1 font-semibold">Image of the meal</label>
                    <input type="file" className= "w-full p-2 border-2 rounded-lg border-green-500" placeholder="Enter nutritional information"/>
                </div> */}
                <button type="Submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                Save</button>
            </form>
        </div>
    </div>
  );
};

export default AddMeals;