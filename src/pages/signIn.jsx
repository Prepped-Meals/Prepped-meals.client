import React from "react";
import signupImage from "../assets/images/SignUpImage.jpg";
import Button from "../components/button.js";

const SignIn = () => {
  return (
    <div className="flex min-h-screen">
      {/*Image*/}
      <div
        className="w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${signupImage})` }}
      ></div>

      {/*form*/}

      <div className="w-1/2 flex items-center justify-center p-10">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Login to your account
          </h2>

          <form>
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input type="text" className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <input type="password" className="w-full border p-2 rounded" />
            </div>

            {/* Button component */}
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
            <a href="SignUp.jsx" className="text-green-600 font-semibold">
              {" "}
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
