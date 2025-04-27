import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { apiClient } from "../api/apiClient";

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
    <div className="min-h-screen bg-gradient-to-br from-[#E9F5EC] via-[#F4F9F4] to-[#D7E7DC] flex items-center justify-center px-4">
      <div className="w-full max-w-md backdrop-blur-md bg-white/70 border border-[#dbe7dc] p-8 rounded-3xl shadow-2xl transition-all duration-300">
        <div className="text-center mb-6">
          <div className="text-5xl animate-pulse">🔐</div>
          <h2 className="text-2xl font-extrabold text-[#004225] mt-2">Reset Password</h2>
        </div>

        {message && (
          <div
            className={`text-sm mb-4 text-center font-medium ${
              message.includes("success") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { name: "currentPassword", label: "Current Password", field: "current" },
            { name: "newPassword", label: "New Password", field: "new" },
            { name: "confirmPassword", label: "Confirm New Password", field: "confirm" },
          ].map(({ name, label, field }) => (
            <div key={name}>
              <label className="block text-sm font-semibold text-[#004225] mb-1">{label}</label>
              <div className="relative">
                <input
                  type={showPassword[field] ? "text" : "password"}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 text-sm text-[#004225] bg-[#f3f6f1] border ${
                    errors[name] ? "border-red-400" : "border-[#bfcab3]"
                  } rounded-xl focus:outline-none focus:ring-2 ${
                    errors[name] ? "focus:ring-red-500" : "focus:ring-[#004225]"
                  } pr-10 transition-all duration-200`}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#004225] hover:text-[#002912] transition-colors"
                  onClick={() => toggleVisibility(field)}
                >
                  {showPassword[field] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-2 mt-2 bg-[#004225] hover:bg-[#002912] text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
