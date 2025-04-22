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

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return setMessage("New passwords do not match");
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
    } catch (error) {
      const err = error.response?.data?.error || "Something went wrong";
      setMessage(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F2] flex flex-col items-center justify-center">
      {/* Title */}
      <div className="px-8 mt-8 w-full text-left pl-16">
        <h2 className="text-3xl font-bold text-[#004225] mb-2">Security</h2>
        <div className="w-16 h-1 bg-[#004225] ml-0"></div>
      </div>

      {/* Form Box */}
      <div className="w-96 bg-[#DCE1DA] p-8 rounded-xl shadow-lg mt-10">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-xl font-semibold text-[#004225]">Reset Password</h2>
        </div>

        {message && (
          <div
            className={`text-sm mb-4 text-center ${
              message.includes("success") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-[#004225]">Current Password</label>
            <div className="relative">
              <input
                type={showPassword.current ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full p-2 border border-[#004225] rounded bg-[#F2F4EF] pr-10 text-[#004225]"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => toggleVisibility("current")}
              >
                {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#004225]">New Password</label>
            <div className="relative">
              <input
                type={showPassword.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full p-2 border border-[#004225] rounded bg-[#F2F4EF] pr-10 text-[#004225]"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => toggleVisibility("new")}
              >
                {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#004225]">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border border-[#004225] rounded bg-[#F2F4EF] pr-10 text-[#004225]"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => toggleVisibility("confirm")}
              >
                {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#004225] text-white p-2 rounded hover:bg-[#00331C]"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
