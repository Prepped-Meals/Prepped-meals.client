import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import signupImage from "../assets/images/foodbg.jpg";
import Button from "../components/button.js";
import { useSaveCusDetails } from "../hooks/useSaveCusDetails";
import { ROUTES } from "../routes/paths";
import { FiUser, FiMail, FiPhone, FiLock, FiCheck, FiEye, FiEyeOff } from "react-icons/fi";

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const saveCustomerMutation = useSaveCusDetails();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone);
  const validatePassword = (password) => password.length >= 6;


  //validations
  const validateField = (name, value) => {
    let error = '';

    //First and Last name validation
    if (name === 'f_name' || name === 'l_name') {
      if (!value.trim()) {
        error = `${name === 'f_name' ? 'First' : 'Last'} name is required`;
      } else if (!/^[A-Za-z]+$/.test(value)) {
        error = `${name === 'f_name' ? 'First' : 'Last'} name must contain only letters`;
      }
    }

    //Email validation
    if (name === 'email') {
      if (!value.trim()) error = 'Email is required';
      else if (!validateEmail(value)) error = 'Invalid email address';
    }

    //Phone number validation
    if (name === 'contact_no') {
      if (!value.trim()) error = 'Phone number is required';
      else if (!validatePhone(value)) error = 'Phone number must be 10 digits';
    }

    //Username validation
    if (name === 'username') {
      if (!value.trim()) error = 'Username is required';
      else if (value.length < 4) error = 'Username must be at least 4 characters';
    }

    //Password validation
    if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (!validatePassword(value)) error = 'Password must be at least 6 characters';
    }

    //Confirm password validation
    if (name === 'confirmPassword') {
      if (!value) error = 'Confirm password is required';
      else if (value !== formData.password) error = 'Passwords do not match';
    }

    return error;
  };

  // Handle input changes and validations
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const validationErrors = {};
    Object.entries(formData).forEach(([name, value]) => {
      const error = validateField(name, value);
      if (error) validationErrors[name] = error;
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      await saveCustomerMutation.mutateAsync(formData);
      setShowSuccess(true);

      setFormData({
        f_name: '',
        l_name: '',
        email: '',
        contact_no: '',
        username: '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error:', error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex justify-end items-center px-4"
      style={{ backgroundImage: `url(${signupImage})` }}
    >
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-xl w-72 text-center">
            <h2 className="text-lg font-semibold text-green-700 mb-4">Signup successful!</h2>
            <button
              onClick={() => {
                setShowSuccess(false);
                navigate(ROUTES.SIGN_IN);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-xl  bg-white bg-opacity-30 backdrop-blur-lg rounded-2xl shadow-lg p-8 md:p-12 border border-white/30 mr-4 md:mr-12">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center bg-green-100 w-16 h-16 rounded-full mb-4">
            <FiUser className="text-green-800 text-2xl" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Fill in your details to get started</p>
        </div>

        {saveCustomerMutation.isError && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-center text-sm">
            An error occurred during signup. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="f_name"
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
                  value={formData.f_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="First Name"
                />
              </div>
              {errors.f_name && (
                <p className="text-red-500 text-xs mt-1">{errors.f_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="l_name"
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
                  value={formData.l_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Last Name"
                />
              </div>
              {errors.l_name && (
                <p className="text-red-500 text-xs mt-1">{errors.l_name}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="example@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="text-gray-400" />
              </div>
              <input
                type="tel"
                name="contact_no"
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
                value={formData.contact_no}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0XXXXXXXXXX"
              />
            </div>
            {errors.contact_no && (
              <p className="text-red-500 text-xs mt-1">{errors.contact_no}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                name="username"
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="username"
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
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
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full flex items-center justify-center bg-green-800 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              isLoading={saveCustomerMutation.isLoading}
            >
              {saveCustomerMutation.isLoading ? 'Creating Account...' : (
                <>
                  Create Account <FiCheck className="ml-2" />
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <a 
              href={ROUTES.SIGN_IN} 
              className="text-green-800 font-medium hover:text-green-700 hover:underline transition-colors"
            >
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;