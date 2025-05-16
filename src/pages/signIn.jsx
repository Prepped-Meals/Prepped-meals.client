import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import signupImage from "../assets/images/foodbg.jpg";
import Button from "../components/button.js";
import { useAuth } from "../context/authContext"; 
import { FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: 'include', 
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      if (data.role === "admin"){
        navigate("/DashboardAdmin"); 
      } else {
        login(data.customer); 
        navigate("/");
      }

    } catch (err) {
      setError(err.message || "Something went wrong, please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-end bg-cover bg-center"
      style={{
        backgroundImage: `url(${signupImage})`,
      }}
    >
      <div className="bg-white/30 backdrop-blur-lg shadow-lg rounded-l-xl w-full max-w-md p-10 m-0 sm:mr-8 md:mr-16 lg:mr-24">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center bg-green-100 w-16 h-16 rounded-full mb-4">
            <FiLock className="text-green-800 text-2xl" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Sign In</h1>
          <p className="text-gray-700">Enter your credentials to access your account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white/70"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white/70"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FiEyeOff className="text-gray-400 hover:text-gray-600" />
                ) : (
                  <FiEye className="text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full flex items-center justify-center bg-green-800 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
            >
              Sign In <FiArrowRight className="ml-2" />
            </Button>
          </div>

          <div className="text-center text-sm text-gray-800 mt-6">
            Don't have an account?{" "}
            <a
              href="/sign-up"
              className="text-green-800 font-medium hover:text-green-700 hover:underline transition-colors"
            >
              Create account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;