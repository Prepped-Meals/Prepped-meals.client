import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { apiClient } from "../api/apiClient";
import { FiLock, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" })); // clear error on change
  };

  //validations
  const validate = () => {
    const newErrors = {};
    const { currentPassword, newPassword, confirmPassword } = formData;

    // 1. Current password required
    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required.";
    }

    // 2. New password required
    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required.";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters.";
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = "New password must be different from current password.";
    }

    // 3. Confirm password required
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await apiClient.post("/api/customers/reset-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setMessage(res.data.message);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    } catch (error) {
      const err = error.response?.data?.error || "Something went wrong";
      setMessage(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-green-800 py-6 px-8 text-white">
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 p-3 rounded-full">
              <FiLock className="h-6 w-6" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center">Reset Your Password</h2>
          <p className="text-green-100 text-sm text-center mt-1">
            Secure your account with a new password
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8">
          {message && (
            <div
              className={`flex items-center justify-center p-3 mb-6 rounded-lg ${
                message.includes("success")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message.includes("success") ? (
                <FiCheckCircle className="mr-2" />
              ) : (
                <FiAlertCircle className="mr-2" />
              )}
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { name: "currentPassword", label: "Current Password", field: "current" },
              { name: "newPassword", label: "New Password", field: "new" },
              { name: "confirmPassword", label: "Confirm Password", field: "confirm" },
            ].map(({ name, label, field }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <div className="relative">
                  <input
                    type={showPassword[field] ? "text" : "password"}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-sm bg-gray-50 border ${
                      errors[name] ? "border-red-400" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 ${
                      errors[name] ? "focus:ring-red-300" : "focus:ring-green-300"
                    } focus:border-transparent pr-10 transition-all`}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => toggleVisibility(field)}
                  >
                    {showPassword[field] ? (
                      <EyeOff size={18} className="text-green-800" />
                    ) : (
                      <Eye size={18} className="text-green-800" />
                    )}
                  </button>
                </div>
                {errors[name] && (
                  <p className="mt-1 text-xs text-red-600">{errors[name]}</p>
                )}
              </div>
            ))}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-green-800 hover:bg-green-900 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                Update Password
              </button>
            </div>
          </form>

          {/* Password Requirements */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Password Requirements
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center">
                <span className="text-green-800 mr-1">•</span>
                Minimum 6 characters
              </li>
              <li className="flex items-center">
                <span className="text-green-800 mr-1">•</span>
                Different from current password
              </li>
              <li className="flex items-center">
                <span className="text-green-800 mr-1">•</span>
                Must match confirmation
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;