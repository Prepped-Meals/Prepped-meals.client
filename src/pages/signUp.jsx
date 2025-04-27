import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import signupImage from "../assets/images/SignUpImage.jpg";
import Button from "../components/button.js";
import { useSaveCusDetails } from "../hooks/useSaveCusDetails";
import { ROUTES } from "../routes/paths";

function SignUp() {
  const [formData, setFormData] = useState({
    f_name: '', 
    l_name: '',
    email: '',
    contact_no: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();
  const saveCustomerMutation = useSaveCusDetails();


  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone);
  const validatePassword = (password) => password.length >= 6;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  //validations
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!validateEmail(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!validatePhone(formData.contact_no)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!validatePassword(formData.password)) {
      alert("Password must be at least 6 characters long.");
      return;
    }


    try {
      await saveCustomerMutation.mutateAsync(formData);
      alert("Signup successful! Please log in to continue");

      
      setFormData({
        f_name: '',
        l_name: '',
        email: '',
        contact_no: '',
        username: '',
        password: '',
        confirmPassword: ''
      });

      navigate(ROUTES.SIGN_IN); // redirect to sign in page
    } catch (error) {
      console.error('Error:', error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Image Section */}
      <div
        className="md:w-1/2 w-full h-screen bg-cover bg-center flex-shrink-0"
        style={{ backgroundImage: `url(${signupImage})` }}
      ></div>

      {/* Form Section */}
      <div className="md:w-1/2 w-full bg-white flex items-center justify-center p-7 mt-10">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-4">Create your account</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {[ 
              { label: "First Name", name: "f_name", type: "text" },
              { label: "Last Name", name: "l_name", type: "text" },
              { label: "Email Address", name: "email", type: "email" },
              { label: "Phone Number", name: "contact_no", type: "tel" },
              { label: "Username", name: "username", type: "text", placeholder: "eg. alexaRawles" },
              { label: "Password", name: "password", type: "password" },
              { label: "Confirm Password", name: "confirmPassword", type: "password" }
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label className="block text-gray-700 text-sm">{label}</label>
                <input
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={formData[name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
            >
              Sign up
            </Button>

            <p className="text-center mt-4">
              Already have an account?{" "}
              <a
                href="/sign in"
                className="text-green-600 font-semibold hover:underline"
              >
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
