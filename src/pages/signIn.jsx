import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import signupImage from "../assets/images/SignUpImage.jpg";
import Button from "../components/button.js";
import { useAuth } from "../context/authContext"; // import auth context

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); //destructure login from context

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // const response = await fetch("http://localhost:8000/api/customers/login", {
        const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Ensure cookies (sessions) are sent
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      login(data.customer); 
      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong, please try again.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Image */}
      <div
        className="w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${signupImage})` }}
      ></div>

      {/* Form */}
      <div className="w-1/2 flex items-center justify-center p-10 bg-[FFFFF]">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold text-center mb-6">Login to your account</h2>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                className="w-full border p-2 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 mt-4"
            >
              Login
            </Button>
          </form>

          <p className="text-center text-sm mt-4">
            Don't have an account?{" "}
            <a href="/sign-up" className="text-green-600 font-semibold">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
