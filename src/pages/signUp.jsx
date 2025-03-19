import React from "react";
import signupImage from "../assets/images/SignUpImage.jpg";
import Button from "../components/button.js";

function SignUp() {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/*Image Section */}
      <div
        className="md:w-1/2 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${signupImage})` }}
      ></div>

      {/*form*/}

      <div className="md:w-1/2  w-full bg-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-6">
            Create your account
          </h2>

          <form className="space-y-4">
            <div>
              <label className="block text-gray-700">First Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700">Last Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700">Phone Number</label>
              <input
                type="tel"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                placeholder="eg. alexaRawles"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700">Confirm Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg"
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
