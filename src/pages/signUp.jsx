import React, { useState } from "react";
import signupImage from "../assets/images/SignUpImage.jpg";
import Button from "../components/button.js";
import { useSaveCusDetails } from "../hooks/useSaveCusDetails";


function SignUp() {
  const [formData, setFormData] = useState({
    f_name :'',
    l_name :'',
    email : '',
    contact_no : '',
    username : '',
    password: '',
    confirmPassword : ''

  });

  const saveCustomerMutation = useSaveCusDetails();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
  }

  try {
    await saveCustomerMutation.mutateAsync(formData);
    alert("Signup successful!");
    setFormData({
      f_name: '',
      l_name: '',
      email: '',
      contact_no: '',
      username: '',
      password: '',
      confirmPassword: ''
    });

  } catch (error) {
    console.error('Error:', error);
    alert("An error occurred. Please try again.");
  }
};

  return (
    <div className="flex flex-col md:flex-row h-screen ">
      
      {/*Image Section */}
      <div
        className="md:w-1/2 w-full h-screen bg-cover bg-center flex-shrink-0"
        style={{ backgroundImage: `url(${signupImage})` }}
      ></div>

      {/*form*/}

      <div className="md:w-1/2  w-full bg-[FFFFF] flex items-center justify-center p-7 mt-10">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-4">
            Create your account
          </h2>

          <form onSubmit = {handleSubmit} className="space-y-3">
            <div>
              <label className="block text-gray-700 text-sm">First Name</label>
              <input
                type="text"
                name="f_name"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                
                value={formData.f_name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm">Last Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                name="l_name"
                    value={formData.l_name}
                    onChange={handleChange}
                    required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm">Email Address</label>
              <input
                type="email"
                name = "email"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.email}
                    onChange={handleChange}
                    required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm">Phone Number</label>
              <input
                type="tel"
                name="contact_no" 
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.contact_no}
                    onChange={handleChange}
                    required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm">Username</label>
              <input
                type="text"
                name="username"
                placeholder="eg. alexaRawles"
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.username}
                    onChange={handleChange}
                    required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm">Password</label>
              <input
                type="password"
                name="password"
                className="w-full px-4 py-2 border rounded-lg text-sm"
                value={formData.password}
                    onChange={handleChange}
                    required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm">Confirm Password</label>
              <input
                type="password"
                 name="confirmPassword"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                value={formData.confirmPassword}
                    onChange={handleChange}
                    required
              />
            </div>

            {/* Using the Button component */}
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
